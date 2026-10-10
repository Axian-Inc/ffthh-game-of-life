const assert = require('node:assert/strict')
const test = require('node:test')

const { createApi } = require('./index')

const responseBody = (response) => JSON.parse(response.body)
const request = (method, path, body) => ({
  requestContext: { http: { method } },
  rawPath: path,
  pathParameters: { id: 'game-1' },
  body: body === undefined ? undefined : JSON.stringify(body),
})

const createStoredGame = (overrides = {}) => ({
  id: 'game-1',
  name: 'Test Game',
  version: 3,
  turnNumber: 2,
  activePlayerIndex: 0,
  players: [
    {
      id: 'player-1',
      name: 'Private Name',
      cityId: 'suburbia',
      careerId: 'content-creator',
      cash: 1000,
      assets: [],
      debts: [],
      netWorth: 1000,
      physicalHealth: 60,
      mentalHealth: 50,
    },
    { id: 'player-2', name: 'Second Player', cityId: 'metro', careerId: 'software-engineer' },
  ],
  moveHistory: [],
  events: [],
  ...overrides,
})

const generatedEvent = {
  title: 'Coastal cleanup opportunity',
  narrative: 'You help with a community effort and feel encouraged.',
  outcome: 'positive',
  effect: { metric: 'mentalHealth', amount: 2 },
  source: {
    publisher: 'NOAA National Ocean Service',
    headline: 'Volunteers support coastal habitat',
    publishedAt: '2026-10-08T00:00:00.000Z',
  },
  generationMode: 'bedrock',
}

const createDependencies = (initialGame) => {
  let game = initialGame
  const calls = { get: 0, invoke: 0, put: [] }
  const dynamo = {
    get: () => ({
      promise: async () => {
        calls.get += 1
        return { Item: game }
      },
    }),
    put: (params) => ({
      promise: async () => {
        calls.put.push(params)
        game = params.Item
        return {}
      },
    }),
    scan: () => ({ promise: async () => ({ Items: game ? [game] : [] }) }),
    delete: () => ({ promise: async () => ({}) }),
  }
  const lambda = {
    invoke: (params) => ({
      promise: async () => {
        calls.invoke += 1
        calls.invokePayload = JSON.parse(params.Payload)
        return { Payload: Buffer.from(JSON.stringify(generatedEvent)) }
      },
    }),
  }
  return { calls, dynamo, lambda, readGame: () => game }
}

test('POST turn advancement invokes the dedicated generator and conditionally persists the result', async () => {
  const dependencies = createDependencies(createStoredGame())
  const api = createApi({
    dynamo: dependencies.dynamo,
    lambda: dependencies.lambda,
    gameTableName: 'games',
    generatorName: 'event-generator',
  })

  const response = await api.handler(
    request('POST', '/games/game-1/turns/advance', { actionType: 'choose_action', expectedVersion: 3 }),
  )
  const body = responseBody(response)

  assert.equal(response.statusCode, 200)
  assert.equal(dependencies.calls.invoke, 1)
  assert.deepEqual(dependencies.calls.invokePayload, {
    gameId: 'game-1',
    turnNumber: 2,
    playerId: 'player-1',
    player: {
      age: 18,
      cityId: 'suburbia',
      careerId: 'content-creator',
      cash: 1000,
      netWorth: 1000,
      physicalHealth: 60,
      mentalHealth: 50,
    },
  })
  assert.equal(body.game.version, 4)
  assert.equal(body.game.activePlayerIndex, 1)
  assert.equal(body.game.players[0].mentalHealth, 52)
  assert.equal(body.event.turnKey, 'game-1:v3')
  assert.equal(body.game.moveHistory[0].eventId, body.event.id)
  assert.equal(body.game.events[0].id, body.event.id)
  assert.equal(dependencies.calls.put[0].ConditionExpression, 'attribute_not_exists(#version) OR #version = :expectedVersion')
  assert.deepEqual(dependencies.calls.put[0].ExpressionAttributeValues, { ':expectedVersion': 3 })
})

test('persists a fallback event and continues the turn after external generation failure', async () => {
  const dependencies = createDependencies(createStoredGame())
  const fallbackEvent = {
    title: 'A quiet afternoon arrives',
    narrative: 'You take a steady day as it comes, with no major change to your plans.',
    outcome: 'neutral',
    effect: { metric: 'mentalHealth', amount: 0 },
    source: {
      publisher: 'Modern Game of Life',
      headline: 'Reviewed family-safe event',
      publishedAt: null,
    },
    generationMode: 'fallback',
  }
  dependencies.lambda.invoke = () => ({
    promise: async () => {
      dependencies.calls.invoke += 1
      return { Payload: Buffer.from(JSON.stringify(fallbackEvent)) }
    },
  })
  const api = createApi({
    dynamo: dependencies.dynamo,
    lambda: dependencies.lambda,
    gameTableName: 'games',
    generatorName: 'event-generator',
  })

  const response = await api.handler(
    request('POST', '/games/game-1/turns/advance', { actionType: 'pass', expectedVersion: 3 }),
  )
  const body = responseBody(response)

  assert.equal(response.statusCode, 200)
  assert.equal(body.event.generationMode, 'fallback')
  assert.equal(body.game.version, 4)
  assert.equal(body.game.activePlayerIndex, 1)
  assert.equal(dependencies.calls.put.length, 1)
})

test('an exact retry returns the persisted event without another generator invocation', async () => {
  const dependencies = createDependencies(createStoredGame())
  const api = createApi({
    dynamo: dependencies.dynamo,
    lambda: dependencies.lambda,
    gameTableName: 'games',
    generatorName: 'event-generator',
  })
  const turnRequest = request('POST', '/games/game-1/turns/advance', { actionType: 'pass', expectedVersion: 3 })

  const first = await api.handler(turnRequest)
  const second = await api.handler(turnRequest)

  assert.equal(first.statusCode, 200)
  assert.equal(second.statusCode, 200)
  assert.equal(responseBody(second).idempotent, true)
  assert.equal(responseBody(second).event.id, responseBody(first).event.id)
  assert.equal(dependencies.calls.invoke, 1)
  assert.equal(dependencies.calls.put.length, 1)
})

test('a stale different request returns 409 with the latest game', async () => {
  const existingEvent = { ...generatedEvent, id: 'event-1', turnKey: 'game-1:v3', playerId: 'player-1', turnNumber: 2 }
  const game = createStoredGame({
    version: 4,
    events: [existingEvent],
    moveHistory: [{ id: 'move-1', eventId: 'event-1', actionType: 'pass' }],
  })
  const dependencies = createDependencies(game)
  const api = createApi({
    dynamo: dependencies.dynamo,
    lambda: dependencies.lambda,
    gameTableName: 'games',
    generatorName: 'event-generator',
  })

  const response = await api.handler(
    request('POST', '/games/game-1/turns/advance', { actionType: 'choose_action', expectedVersion: 3 }),
  )

  assert.equal(response.statusCode, 409)
  assert.equal(responseBody(response).code, 'TURN_CONFLICT')
  assert.equal(responseBody(response).game.version, 4)
  assert.equal(dependencies.calls.invoke, 0)
})

test('generic update cannot change protected turn or player state', async () => {
  const game = createStoredGame()
  const dependencies = createDependencies(game)
  const api = createApi({ dynamo: dependencies.dynamo, gameTableName: 'games' })

  const response = await api.handler(
    request('PUT', '/games/game-1', {
      game: { ...game, turnNumber: 3, activePlayerIndex: 1, version: 4 },
    }),
  )

  assert.equal(response.statusCode, 409)
  assert.equal(responseBody(response).code, 'TURN_UPDATE_REQUIRED')
  assert.equal(dependencies.calls.put.length, 0)
})

test('does not rotate or persist when event generation fails', async () => {
  const game = createStoredGame()
  const dependencies = createDependencies(game)
  dependencies.lambda.invoke = () => ({ promise: async () => ({ FunctionError: 'Unhandled', Payload: '{}' }) })
  const api = createApi({
    dynamo: dependencies.dynamo,
    lambda: dependencies.lambda,
    gameTableName: 'games',
    generatorName: 'event-generator',
  })

  const response = await api.handler(
    request('POST', '/games/game-1/turns/advance', { actionType: 'pass', expectedVersion: 3 }),
  )

  assert.equal(response.statusCode, 502)
  assert.equal(dependencies.calls.put.length, 0)
  assert.equal(dependencies.readGame().version, 3)
  assert.equal(dependencies.readGame().activePlayerIndex, 0)
})
