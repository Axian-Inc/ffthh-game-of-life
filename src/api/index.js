const AWS = require('aws-sdk')
const crypto = require('crypto')

const dynamo = new AWS.DynamoDB.DocumentClient()
const tableName = process.env.TABLE_NAME

const SETUP_PHASE = 'setup-in-progress'
const STARTED_PHASE = 'started'

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

const normalizeNumber = (value, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return fallback
}

const normalizePlayer = (player = {}) => {
  const avatar = player.avatar ?? player.gravitar ?? player.gravatar ?? null
  return {
    ...player,
    id: player.id == null ? undefined : String(player.id),
    avatar,
    gravitar: avatar,
    cityId: player.cityId ?? null,
    educationTrackId: player.educationTrackId ?? null,
    jobId: player.jobId ?? null,
    annualSalary: normalizeNumber(player.annualSalary),
    monthlyIncome: normalizeNumber(player.monthlyIncome),
    cash: normalizeNumber(player.cash),
    debt: normalizeNumber(player.debt),
    assets: normalizeNumber(player.assets),
    investments: normalizeNumber(player.investments),
    netWorth: normalizeNumber(player.netWorth),
  }
}

const inferLifecyclePhase = (game, players) => {
  if (game.lifecycle && game.lifecycle.phase) {
    return game.lifecycle.phase
  }
  if (game.startedAt != null) {
    return STARTED_PHASE
  }
  const hasPlayers = players.length > 0
  const hasSetupSelections = hasPlayers && players.every((player) => player.jobId || player.careerTrack)
  return hasSetupSelections ? STARTED_PHASE : SETUP_PHASE
}

const normalizeGame = (game = {}) => {
  const players = Array.isArray(game.players) ? game.players.map(normalizePlayer) : []
  const lifecyclePhase = inferLifecyclePhase(game, players)
  const startedAtFallback = game.lastUpdated ?? game.createdAt ?? 0
  const startedAt = lifecyclePhase === STARTED_PHASE ? normalizeNumber(game.startedAt, startedAtFallback) : null
  return {
    ...game,
    id: game.id == null ? '' : String(game.id),
    players,
    lifecycle: {
      ...(game.lifecycle || {}),
      phase: lifecyclePhase,
    },
    startedAt,
  }
}

const listGames = async () => {
  const result = await dynamo
    .scan({
      TableName: tableName,
    })
    .promise()
  const items = Array.isArray(result.Items) ? result.Items.map(normalizeGame) : []
  return jsonResponse(200, { games: items })
}

const createGame = async (event) => {
  const body = parseBody(event)
  if (!body || typeof body.game !== 'object' || body.game === null) {
    return jsonResponse(400, { message: 'Missing game payload.' })
  }

  const game = normalizeGame(body.game)
  if (!game.id) {
    game.id = crypto.randomUUID()
  }

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

  const game = normalizeGame({
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

exports.handler = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return jsonResponse(204)
  }

  const method = event.requestContext?.http?.method || event.httpMethod
  const path = event.rawPath || event.path || ''

  if (method === 'GET' && path.endsWith('/games')) {
    return listGames()
  }

  if (method === 'POST' && path.endsWith('/games')) {
    return createGame(event)
  }

  if (method === 'DELETE') {
    const gameId = event.pathParameters?.id
    return deleteGame(gameId)
  }

  if (method === 'PUT') {
    const gameId = event.pathParameters?.id
    return updateGame(event, gameId)
  }

  return jsonResponse(404, { message: 'Not found.' })
}
