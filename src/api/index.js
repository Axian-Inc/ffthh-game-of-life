const AWS = require('aws-sdk')
const crypto = require('crypto')

const dynamo = new AWS.DynamoDB.DocumentClient()
const tableName = process.env.TABLE_NAME

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const calculateNetWorth = ({ cash, debt, assets, investments }) => cash + assets + investments - debt

const normalizeLifecycle = (game) => {
  const phase = game?.lifecycle?.phase
  if (phase === 'setup-in-progress' || phase === 'started') {
    return { phase }
  }

  if (game?.startedAt) {
    return { phase: 'started' }
  }

  return { phase: 'setup-in-progress' }
}

const normalizePlayer = (player) => ({
  ...player,
  id: player?.id ? String(player.id) : '',
  name: player?.name || '',
  avatar: player?.avatar || '',
  cityId: player?.cityId || '',
  educationTrackId: player?.educationTrackId || '',
  jobId: player?.jobId || '',
  careerTrack: player?.careerTrack || '',
  annualSalary: normalizeNumber(player?.annualSalary),
  monthlyIncome: normalizeNumber(player?.monthlyIncome),
  cash: normalizeNumber(player?.cash),
  debt: normalizeNumber(player?.debt),
  assets: normalizeNumber(player?.assets),
  investments: normalizeNumber(player?.investments),
  netWorth:
    player?.netWorth === undefined || player?.netWorth === null
      ? calculateNetWorth({
          cash: normalizeNumber(player?.cash),
          debt: normalizeNumber(player?.debt),
          assets: normalizeNumber(player?.assets),
          investments: normalizeNumber(player?.investments),
        })
      : normalizeNumber(player?.netWorth),
})

const normalizeGame = (game) => ({
  ...game,
  id: String(game?.id || ''),
  name: game?.name || '',
  players: Array.isArray(game?.players) ? game.players.map(normalizePlayer) : [],
  currentStep: Number.isInteger(game?.currentStep) ? game.currentStep : 0,
  lifecycle: normalizeLifecycle(game),
  startedAt: game?.startedAt ? normalizeNumber(game.startedAt) : null,
})

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

const listGames = async () => {
  const result = await dynamo
    .scan({
      TableName: tableName,
    })
    .promise()
  const items = Array.isArray(result.Items) ? result.Items : []
  return jsonResponse(200, { games: items.map(normalizeGame) })
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

  const game = {
    ...normalizeGame(body.game),
    id: gameId,
  }

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
