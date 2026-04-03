const AWS = require('aws-sdk')
const crypto = require('crypto')
const { advanceTurnState, normalizeGameState } = require('./turnEngine')

const dynamo = new AWS.DynamoDB.DocumentClient()
const tableName = process.env.TABLE_NAME

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
  } catch (error) {
    return null
  }
}

const getStoredGame = async (gameId) => {
  const result = await dynamo
    .get({
      TableName: tableName,
      Key: { id: String(gameId) },
    })
    .promise()
  return result.Item || null
}

const listGames = async () => {
  const result = await dynamo
    .scan({
      TableName: tableName,
    })
    .promise()
  const items = Array.isArray(result.Items) ? result.Items.map((item) => normalizeGameState(item)) : []
  return jsonResponse(200, { games: items })
}

const getGame = async (gameId) => {
  if (!gameId) {
    return jsonResponse(400, { message: 'Missing game id.' })
  }
  const game = await getStoredGame(gameId)
  if (!game) {
    return jsonResponse(404, { message: 'Game not found.' })
  }
  return jsonResponse(200, { game: normalizeGameState(game) })
}

const createGame = async (event) => {
  const body = parseBody(event)
  if (!body || typeof body.game !== 'object' || body.game === null) {
    return jsonResponse(400, { message: 'Missing game payload.' })
  }

  const game = normalizeGameState({
    ...body.game,
    id: body.game.id || crypto.randomUUID(),
  })

  await dynamo
    .put({
      TableName: tableName,
      Item: game,
    })
    .promise()

  return jsonResponse(201, { game })
}

const deleteGame = async (gameId) => {
  if (!gameId) {
    return jsonResponse(400, { message: 'Missing game id.' })
  }
  await dynamo
    .delete({
      TableName: tableName,
      Key: { id: gameId },
    })
    .promise()
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

  const game = normalizeGameState({
    ...body.game,
    id: gameId,
  })

  await dynamo
    .put({
      TableName: tableName,
      Item: game,
    })
    .promise()

  return jsonResponse(200, { game })
}

const advanceTurn = async (event, gameId) => {
  if (!gameId) {
    return jsonResponse(400, { message: 'Missing game id.' })
  }

  const body = parseBody(event)
  if (!body || typeof body !== 'object') {
    return jsonResponse(400, { message: 'Missing turn payload.' })
  }

  const existingGame = await getStoredGame(gameId)
  if (!existingGame) {
    return jsonResponse(404, { message: 'Game not found.' })
  }

  try {
    const result = advanceTurnState(existingGame, body)
    await dynamo
      .put({
        TableName: tableName,
        Item: result.game,
      })
      .promise()
    return jsonResponse(200, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to advance turn.'
    if (message === 'Unknown action') {
      return jsonResponse(422, { message })
    }
    if (message === 'Game version is out of date') {
      return jsonResponse(409, { message })
    }
    if (message === 'This is not the active player turn' || message === 'Game is not ready for a turn') {
      return jsonResponse(409, { message })
    }
    return jsonResponse(400, { message })
  }
}

exports.handler = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return jsonResponse(204)
  }

  const method = event.requestContext?.http?.method || event.httpMethod
  const path = event.rawPath || event.path || ''
  const gameId = event.pathParameters?.id

  if (method === 'GET' && path.endsWith('/games')) {
    return listGames()
  }

  if (method === 'GET' && gameId) {
    return getGame(gameId)
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
