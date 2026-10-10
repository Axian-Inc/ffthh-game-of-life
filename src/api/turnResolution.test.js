const assert = require('node:assert/strict')
const test = require('node:test')

const {
  TurnResolutionError,
  buildTurnKey,
  completeAdvance,
  prepareAdvance,
} = require('./turnResolution')

const createGame = (overrides = {}) => ({
  id: 'game-1',
  version: 4,
  turnNumber: 2,
  activePlayerIndex: 0,
  players: [
    {
      id: 'player-1',
      name: 'Ari',
      cityId: 'suburbia',
      careerId: 'content-creator',
      cash: 1000,
      assets: [{ currentValue: 500 }],
      debts: [{ balance: 200 }],
      physicalHealth: 99,
      mentalHealth: 50,
    },
    { id: 'player-2', name: 'Jo', cityId: 'metro', careerId: 'software-engineer' },
  ],
  moveHistory: [],
  events: [],
  ...overrides,
})

const generatedEvent = (effect = { metric: 'cash', amount: 100 }) => ({
  title: 'A useful community project',
  narrative: 'Your contribution leads to a small and encouraging result.',
  outcome: effect.amount > 0 ? 'positive' : effect.amount < 0 ? 'negative' : 'neutral',
  effect,
  source: {
    publisher: 'NOAA National Ocean Service',
    headline: 'Community project supports the coast',
    publishedAt: '2026-10-08T00:00:00.000Z',
  },
  generationMode: 'bedrock',
})

test('completes a turn, applies its effect, records the event, and rotates players', () => {
  const game = createGame()
  const prepared = prepareAdvance({ gameId: game.id, game, actionType: 'choose_action', expectedVersion: 4 })
  const completed = completeAdvance({
    game,
    prepared,
    actionType: 'choose_action',
    generatedEvent: generatedEvent(),
    now: 1234,
    eventId: 'event-1',
  })

  assert.equal(completed.game.version, 5)
  assert.equal(completed.game.activePlayerIndex, 1)
  assert.equal(completed.game.turnNumber, 2)
  assert.equal(completed.game.players[0].cash, 1100)
  assert.equal(completed.game.players[0].netWorth, 1400)
  assert.deepEqual(completed.event, {
    id: 'event-1',
    turnKey: 'game-1:v4',
    playerId: 'player-1',
    turnNumber: 2,
    ...generatedEvent(),
    createdAt: 1234,
  })
  assert.equal(completed.game.moveHistory[0].eventId, 'event-1')
  assert.equal(completed.game.events[0].id, 'event-1')
})

test('clamps health effects and increments the round after the final player', () => {
  const game = createGame({ activePlayerIndex: 1 })
  const prepared = prepareAdvance({ gameId: game.id, game, actionType: 'pass', expectedVersion: 4 })
  const completed = completeAdvance({
    game,
    prepared,
    actionType: 'pass',
    generatedEvent: generatedEvent({ metric: 'physicalHealth', amount: 5 }),
    eventId: 'event-health',
  })

  assert.equal(completed.game.players[1].physicalHealth, 55)
  assert.equal(completed.game.activePlayerIndex, 0)
  assert.equal(completed.game.turnNumber, 3)
})

test('recognizes an already completed turn without generating another event', () => {
  const event = { id: 'saved-event', turnKey: buildTurnKey('game-1', 4) }
  const game = createGame({
    version: 5,
    events: [event],
    moveHistory: [{ eventId: event.id, actionType: 'pass' }],
  })

  const prepared = prepareAdvance({ gameId: game.id, game, actionType: 'pass', expectedVersion: 4 })
  assert.deepEqual(prepared, {
    status: 'completed',
    turnKey: 'game-1:v4',
    event,
    move: game.moveHistory[0],
  })
})

test('rejects a stale different action and malformed generated event', () => {
  const event = { id: 'saved-event', turnKey: buildTurnKey('game-1', 4) }
  const game = createGame({
    version: 5,
    events: [event],
    moveHistory: [{ eventId: event.id, actionType: 'pass' }],
  })

  assert.throws(
    () => prepareAdvance({ gameId: game.id, game, actionType: 'choose_action', expectedVersion: 4 }),
    (error) => error instanceof TurnResolutionError && error.code === 'TURN_CONFLICT',
  )

  const currentGame = createGame()
  const prepared = prepareAdvance({ gameId: currentGame.id, game: currentGame, actionType: 'pass', expectedVersion: 4 })
  assert.throws(
    () =>
      completeAdvance({
        game: currentGame,
        prepared,
        actionType: 'pass',
        generatedEvent: { ...generatedEvent(), unexpected: true, source: null },
      }),
    /source is invalid/,
  )
})
