import { calculateNetWorth, clampHealth } from '../utils/playerState'

const ACTION_LABELS = {
  choose_action: 'Choose Action',
  pass: 'Pass',
}

const FALLBACK_EVENTS = [
  {
    title: 'A neighbor shares a useful tip',
    narrative: 'A small piece of advice helps you save a little money this month.',
    outcome: 'positive',
    effect: { metric: 'cash', amount: 100 },
  },
  {
    title: 'A quiet afternoon arrives',
    narrative: 'You take a steady day as it comes, with no major change to your plans.',
    outcome: 'neutral',
    effect: { metric: 'mentalHealth', amount: 0 },
  },
  {
    title: 'An everyday repair comes up',
    narrative: 'A routine repair uses a small part of your savings, but you handle it.',
    outcome: 'negative',
    effect: { metric: 'cash', amount: -100 },
  },
  {
    title: 'A walk brings fresh energy',
    narrative: 'Time outdoors leaves you feeling a little more refreshed.',
    outcome: 'positive',
    effect: { metric: 'physicalHealth', amount: 2 },
  },
]

export class TurnConflictError extends Error {
  constructor(message, game) {
    super(message)
    this.name = 'TurnConflictError'
    this.status = 409
    this.game = game
  }
}

const hashText = (value) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export const buildTurnKey = (gameId, expectedVersion) => `${String(gameId)}:v${expectedVersion}`

const applyEffect = (player, effect) => {
  const updated = { ...player }
  if (effect.metric === 'cash') {
    updated.cash += effect.amount
    updated.netWorth = calculateNetWorth(updated)
  } else {
    updated[effect.metric] = clampHealth(updated[effect.metric] + effect.amount)
  }
  return updated
}

const createFallbackEvent = ({ player, turnNumber, turnKey, now }) => {
  const selected = FALLBACK_EVENTS[hashText(turnKey) % FALLBACK_EVENTS.length]
  return {
    id: `local-event-${hashText(`${turnKey}:event`)}`,
    turnKey,
    playerId: String(player.id),
    turnNumber,
    ...selected,
    effect: { ...selected.effect },
    source: {
      publisher: 'Modern Game of Life',
      headline: 'Offline family-safe event',
      publishedAt: null,
    },
    generationMode: 'fallback',
    createdAt: now,
  }
}

export const advanceLocalGameTurn = (game, { actionType, expectedVersion }, now = Date.now()) => {
  if (!Object.hasOwn(ACTION_LABELS, actionType)) {
    throw new Error('Invalid turn action.')
  }
  const turnKey = buildTurnKey(game.id, expectedVersion)
  const existingEvent = game.events.find((event) => event.turnKey === turnKey)
  if (existingEvent) {
    const existingMove = game.moveHistory.find((move) => move.eventId === existingEvent.id)
    if (existingMove?.actionType === actionType) {
      return { game, event: existingEvent, idempotent: true }
    }
    throw new TurnConflictError('That turn was completed with a different action.', game)
  }
  if (game.version !== expectedVersion) {
    throw new TurnConflictError('The game changed before this turn could be completed.', game)
  }
  if (game.players.length === 0) {
    throw new Error('The game has no active player.')
  }

  const activePlayerIndex = game.activePlayerIndex % game.players.length
  const activePlayer = game.players[activePlayerIndex]
  const event = createFallbackEvent({
    player: activePlayer,
    turnNumber: game.turnNumber,
    turnKey,
    now,
  })
  const players = [...game.players]
  players[activePlayerIndex] = applyEffect(activePlayer, event.effect)
  const nextPlayerIndex = (activePlayerIndex + 1) % players.length
  const nextTurnNumber = nextPlayerIndex === 0 ? game.turnNumber + 1 : game.turnNumber
  const move = {
    id: `local-move-${hashText(`${turnKey}:move`)}`,
    playerId: String(activePlayer.id),
    playerName: activePlayer.name?.trim() || `Player ${activePlayerIndex + 1}`,
    turnNumber: game.turnNumber,
    actionType,
    actionLabel: ACTION_LABELS[actionType],
    eventId: event.id,
    createdAt: now,
  }
  const updatedGame = {
    ...game,
    version: game.version + 1,
    players,
    turnNumber: nextTurnNumber,
    activePlayerIndex: nextPlayerIndex,
    moveHistory: [...game.moveHistory, move],
    events: [...game.events, event],
    lastUpdated: now,
  }
  return { game: updatedGame, event, idempotent: false }
}

export { FALLBACK_EVENTS }
