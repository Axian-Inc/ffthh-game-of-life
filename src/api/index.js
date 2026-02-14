const express = require('express')
const { randomUUID } = require('crypto')
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb')
const {
  createGame,
  updateGame,
  deleteGame,
  getGameById,
  listGamesByUser,
} = require('./services/gameService')
const { isNonEmptyString } = require('./services/gameValidation')

const TABLE_NAME = process.env.GAME_TABLE_NAME
const REGION = process.env.AWS_REGION || 'us-west-2'
const ENDPOINT = process.env.DDB_ENDPOINT

if (!TABLE_NAME) {
  throw new Error('GAME_TABLE_NAME is required')
}

const buildClientConfig = () => {
  const config = { region: REGION }
  if (ENDPOINT) {
    config.endpoint = ENDPOINT
    if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = { accessKeyId: 'local', secretAccessKey: 'local' }
    }
  }
  return config
}

const ddbClient = new DynamoDBClient(buildClientConfig())
const docClient = DynamoDBDocumentClient.from(ddbClient)

const mapItemToRecord = (item) => {
  if (!item) {
    return null
  }
  return {
    id: item.game_id,
    userId: item.user_id,
    name: item.name,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    players: item.players,
    currentTurnState: item.current_turn_state,
    metadata: item.metadata,
    version: item.version,
  }
}

const mapGameToItem = (game, userId) => ({
  user_id: userId,
  game_id: game.id,
  name: game.name,
  status: game.status,
  created_at: game.createdAt,
  updated_at: game.updatedAt,
  players: game.players,
  current_turn_state: game.currentTurnState,
  metadata: game.metadata,
  version: game.version,
})

const requireUserId = (req, res) => {
  const userId = req.header('x-user-id')
  if (!isNonEmptyString(userId)) {
    res.status(400).json({ error: 'x-user-id header is required.' })
    return null
  }
  return userId.trim()
}

const sendServerError = (res, message) => {
  const correlationId = randomUUID()
  res.status(500).json({ error: { message, correlationId } })
}

const repo = {
  async createGame(userId, game) {
    const item = mapGameToItem(game, userId)
    try {
      await docClient.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: TABLE_NAME,
                Item: item,
                ConditionExpression: 'attribute_not_exists(game_id)',
              },
            },
          ],
        }),
      )
      return mapItemToRecord(item)
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        return null
      }
      throw error
    }
  },
  async updateGame(userId, game, expectedVersion) {
    const item = mapGameToItem(game, userId)
    try {
      await docClient.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: TABLE_NAME,
                Item: item,
                ConditionExpression: 'attribute_exists(game_id) AND version = :expectedVersion',
                ExpressionAttributeValues: {
                  ':expectedVersion': expectedVersion,
                },
              },
            },
          ],
        }),
      )
      return mapItemToRecord(item)
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        return null
      }
      throw error
    }
  },
  async deleteGame(userId, gameId) {
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            user_id: userId,
            game_id: gameId,
          },
          ConditionExpression: 'attribute_exists(game_id)',
        }),
      )
      return true
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        return false
      }
      throw error
    }
  },
  async getGameById(gameId) {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'game_id_idx',
        KeyConditionExpression: 'game_id = :gameId',
        ExpressionAttributeValues: {
          ':gameId': gameId,
        },
        Limit: 1,
      }),
    )
    return result.Items && result.Items.length ? mapItemToRecord(result.Items[0]) : null
  },
  async listGamesByUser(userId) {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'user_id = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      }),
    )
    return (result.Items || []).map(mapItemToRecord)
  },
}

const app = express()
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

app.post('/games', async (req, res) => {
  const userId = requireUserId(req, res)
  if (!userId) {
    return
  }

  try {
    const game = await createGame({ payload: req.body, userId, repo })
    res.status(201).json({ game })
  } catch (error) {
    if (error.type === 'validation') {
      res.status(400).json({ error: { message: 'Validation failed.', details: error.details } })
      return
    }
    sendServerError(res, 'Unable to save game.')
  }
})

app.put('/games/:id', async (req, res) => {
  const userId = requireUserId(req, res)
  if (!userId) {
    return
  }

  try {
    const game = await updateGame({
      gameId: req.params.id,
      payload: req.body,
      userId,
      repo,
    })
    res.status(200).json({ game })
  } catch (error) {
    if (error.type === 'validation') {
      res.status(400).json({ error: { message: 'Validation failed.', details: error.details } })
      return
    }
    if (error.type === 'notFound') {
      res.status(404).json({ error: error.message })
      return
    }
    if (error.type === 'forbidden') {
      res.status(403).json({ error: error.message })
      return
    }
    if (error.type === 'conflict') {
      res.status(409).json({ error: error.message })
      return
    }
    sendServerError(res, 'Unable to update game.')
  }
})

app.get('/games/:id', async (req, res) => {
  const gameId = req.params.id
  if (!isNonEmptyString(gameId)) {
    res.status(400).json({ error: 'Game id is required.' })
    return
  }

  try {
    const game = await getGameById({ gameId, repo })
    res.status(200).json({ game })
  } catch (error) {
    if (error.type === 'notFound') {
      res.status(404).json({ error: error.message })
      return
    }
    sendServerError(res, 'Unable to fetch game.')
  }
})

app.get('/users/:userId/games', async (req, res) => {
  const userId = req.params.userId
  if (!isNonEmptyString(userId)) {
    res.status(400).json({ error: 'User id is required.' })
    return
  }

  try {
    const games = await listGamesByUser({ userId, repo })
    res.status(200).json({ games })
  } catch (error) {
    sendServerError(res, 'Unable to fetch games.')
  }
})

app.delete('/games/:id', async (req, res) => {
  const userId = requireUserId(req, res)
  if (!userId) {
    return
  }

  const gameId = req.params.id
  if (!isNonEmptyString(gameId)) {
    res.status(400).json({ error: 'Game id is required.' })
    return
  }

  try {
    await deleteGame({ gameId, userId, repo })
    res.status(204).send()
  } catch (error) {
    if (error.type === 'notFound') {
      res.status(404).json({ error: error.message })
      return
    }
    if (error.type === 'forbidden') {
      res.status(403).json({ error: error.message })
      return
    }
    sendServerError(res, 'Unable to delete game.')
  }
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Game Hub API listening on port ${port}`)
})
