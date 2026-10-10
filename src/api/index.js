const AWS = require('aws-sdk')
const crypto = require('crypto')
const { buildAnonymousPlayerContext } = require('./eventGenerator')
const {
  TurnResolutionError,
  completeAdvance,
  findCompletedTurn,
  normalizeVersion,
  prepareAdvance,
} = require('./turnResolution')

const defaultDynamo = new AWS.DynamoDB.DocumentClient()
const defaultLambda = new AWS.Lambda()
const tableName = process.env.TABLE_NAME
const eventGeneratorFunctionName = process.env.EVENT_GENERATOR_FUNCTION_NAME
const PROTECTED_GAME_FIELDS = Object.freeze([
  'version',
  'turnNumber',
  'activePlayerIndex',
  'players',
  'moveHistory',
  'events',
])

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  },
  body: body ? JSON.stringify(body) : '',
})

const parseBody = (event) => {
  if (!event.body) {
    return null
  }
  try {
    return JSON.parse(event.body)
  } catch {
    return null
  }
}

const valuesEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right)

const createApi = ({
  dynamo = defaultDynamo,
  lambda = defaultLambda,
  gameTableName = tableName,
  generatorName = eventGeneratorFunctionName,
} = {}) => {
  const getGame = async (gameId) => {
    const result = await dynamo
      .get({
        TableName: gameTableName,
        Key: { id: gameId },
        ConsistentRead: true,
      })
      .promise()
    return result.Item || null
  }

  const listGames = async () => {
    const result = await dynamo.scan({ TableName: gameTableName }).promise()
    return jsonResponse(200, { games: Array.isArray(result.Items) ? result.Items : [] })
  }

  const createGame = async (event) => {
    const body = parseBody(event)
    if (!body || typeof body.game !== 'object' || body.game === null) {
      return jsonResponse(400, { message: 'Missing game payload.' })
    }

    const game = {
      ...body.game,
      id: body.game.id ? String(body.game.id) : crypto.randomUUID(),
      version: 1,
      turnNumber: 1,
      activePlayerIndex: 0,
      moveHistory: [],
      events: [],
    }
    await dynamo.put({ TableName: gameTableName, Item: game }).promise()
    return jsonResponse(201, { game })
  }

  const deleteGame = async (gameId) => {
    if (!gameId) {
      return jsonResponse(400, { message: 'Missing game id.' })
    }
    await dynamo.delete({ TableName: gameTableName, Key: { id: gameId } }).promise()
    return jsonResponse(204)
  }

  const updateGame = async (event, gameId) => {
    if (!gameId) {
      return jsonResponse(400, { message: 'Missing game id.' })
    }
    const body = parseBody(event)
    if (!body || typeof body.game !== 'object' || body.game === null) {
      return jsonResponse(400, { message: 'Missing game payload.' })
    }
    const existing = await getGame(gameId)
    if (!existing) {
      return jsonResponse(404, { message: 'Game not found.' })
    }
    const changesProtectedState = PROTECTED_GAME_FIELDS.some(
      (field) => Object.hasOwn(body.game, field) && !valuesEqual(body.game[field], existing[field]),
    )
    if (changesProtectedState) {
      return jsonResponse(409, {
        code: 'TURN_UPDATE_REQUIRED',
        message: 'Turn and player state must be changed through the turn advancement endpoint.',
        game: existing,
      })
    }

    const game = {
      ...existing,
      ...body.game,
      id: gameId,
      version: normalizeVersion(existing.version),
    }
    await dynamo.put({ TableName: gameTableName, Item: game }).promise()
    return jsonResponse(200, { game })
  }

  const generateEvent = async (payload) => {
    if (!generatorName) {
      throw new Error('The event generator function is not configured.')
    }
    const result = await lambda
      .invoke({
        FunctionName: generatorName,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(payload),
      })
      .promise()
    if (result.FunctionError) {
      throw new Error('The event generator function failed.')
    }
    try {
      return JSON.parse(Buffer.from(result.Payload || '').toString('utf8'))
    } catch (error) {
      throw new Error('The event generator returned an invalid response.', { cause: error })
    }
  }

  const conflictResponse = (message, game) =>
    jsonResponse(409, {
      code: 'TURN_CONFLICT',
      message,
      game,
    })

  const advanceTurn = async (event, gameId) => {
    if (!gameId) {
      return jsonResponse(400, { message: 'Missing game id.' })
    }
    const body = parseBody(event)
    if (!body) {
      return jsonResponse(400, { message: 'Missing turn payload.' })
    }
    const game = await getGame(gameId)
    if (!game) {
      return jsonResponse(404, { message: 'Game not found.' })
    }

    let prepared
    try {
      prepared = prepareAdvance({
        gameId,
        game,
        actionType: body.actionType,
        expectedVersion: body.expectedVersion,
      })
    } catch (error) {
      if (error instanceof TurnResolutionError && error.code === 'TURN_CONFLICT') {
        return conflictResponse(error.message, game)
      }
      if (error instanceof TurnResolutionError) {
        return jsonResponse(400, { code: error.code, message: error.message })
      }
      throw error
    }

    if (prepared.status === 'completed') {
      return jsonResponse(200, { game, event: prepared.event, idempotent: true })
    }

    let completed
    try {
      const generatedEvent = await generateEvent({
        gameId,
        turnNumber: prepared.turnNumber,
        playerId: prepared.activePlayer.id,
        player: buildAnonymousPlayerContext(prepared.activePlayer),
      })
      completed = completeAdvance({
        game,
        prepared,
        actionType: body.actionType,
        generatedEvent,
      })
    } catch (error) {
      return jsonResponse(502, {
        code: error.code || 'EVENT_GENERATION_FAILED',
        message: 'The player event could not be generated.',
      })
    }

    try {
      await dynamo
        .put({
          TableName: gameTableName,
          Item: completed.game,
          ConditionExpression: 'attribute_not_exists(#version) OR #version = :expectedVersion',
          ExpressionAttributeNames: { '#version': 'version' },
          ExpressionAttributeValues: { ':expectedVersion': body.expectedVersion },
        })
        .promise()
      return jsonResponse(200, completed)
    } catch (error) {
      if (error?.code !== 'ConditionalCheckFailedException') {
        throw error
      }
      const latestGame = await getGame(gameId)
      const persisted = findCompletedTurn(latestGame, prepared.turnKey)
      if (persisted && persisted.move.actionType === body.actionType) {
        return jsonResponse(200, { game: latestGame, event: persisted.event, idempotent: true })
      }
      return conflictResponse('The game changed before this turn could be saved.', latestGame)
    }
  }

  const handler = async (event) => {
    if (event.requestContext?.http?.method === 'OPTIONS') {
      return jsonResponse(204)
    }
    const method = event.requestContext?.http?.method || event.httpMethod
    const path = event.rawPath || event.path || ''
    const gameId = event.pathParameters?.id

    if (method === 'GET' && path.endsWith('/games')) {
      return listGames()
    }
    if (method === 'POST' && path.endsWith('/games')) {
      return createGame(event)
    }
    if (method === 'POST' && path.endsWith('/turns/advance')) {
      return advanceTurn(event, gameId)
    }
    if (method === 'DELETE') {
      return deleteGame(gameId)
    }
    if (method === 'PUT') {
      return updateGame(event, gameId)
    }
    return jsonResponse(404, { message: 'Not found.' })
  }

  return { advanceTurn, handler, updateGame }
}

const api = createApi()

module.exports = {
  PROTECTED_GAME_FIELDS,
  createApi,
  handler: api.handler,
  jsonResponse,
  parseBody,
}
