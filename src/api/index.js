const AWS = require('aws-sdk')
const crypto = require('crypto')

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

const normalizePlayer = (player = {}) => ({
  id: String(player.id || ''),
  name: player.name || 'Player',
  avatar: player.avatar || 'octopus',
  cityId: player.cityId || '',
  educationTrackId: player.educationTrackId || '',
  jobId: player.jobId || '',
  annualSalary: Number.isFinite(player.annualSalary) ? player.annualSalary : 0,
  monthlyIncome: Number.isFinite(player.monthlyIncome) ? player.monthlyIncome : 0,
  cash: Number.isFinite(player.cash) ? player.cash : 0,
  debt: Number.isFinite(player.debt) ? player.debt : 0,
  assets: Number.isFinite(player.assets) ? player.assets : 0,
  investments: Number.isFinite(player.investments) ? player.investments : 0,
  netWorth: Number.isFinite(player.netWorth) ? player.netWorth : 0,
})

const normalizeGame = (game = {}) => ({
  ...game,
  id: String(game.id || ''),
  lifecycle: {
    phase: game?.lifecycle?.phase || 'started',
  },
  startedAt: game.startedAt || null,
  players: Array.isArray(game.players) ? game.players.map(normalizePlayer) : [],
})

const listGames = async () => {
  const result = await dynamo
    .scan({
      TableName: tableName,
    })
    .promise()
  const items = Array.isArray(result.Items) ? result.Items : []
  return jsonResponse(200, { games: items })
}

const createGame = async (event) => {
  const body = parseBody(event)
  if (!body || typeof body.game !== 'object' || body.game === null) {
    return jsonResponse(400, { message: 'Missing game payload.' })
  }

  const game = normalizeGame({ ...body.game })
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
