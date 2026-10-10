const crypto = require('crypto')
const { validateLifeEvent } = require('./eventGenerator')

const ACTION_LABELS = Object.freeze({
  choose_action: 'Choose Action',
  pass: 'Pass',
})
const DEFAULT_CAREER_ID = 'content-creator'
const DEFAULT_CITY_ID = 'suburbia'
const DEGREE_CAREERS = new Set(['software-engineer', 'registered-nurse', 'financial-analyst'])
const CAREER_STARTS = Object.freeze({
  'software-engineer': { cash: 4000, debt: 30000, physicalHealth: 50, mentalHealth: 40 },
  'registered-nurse': { cash: 3500, debt: 24000, physicalHealth: 60, mentalHealth: 50 },
  'financial-analyst': { cash: 4500, debt: 28000, physicalHealth: 40, mentalHealth: 50 },
  electrician: { cash: 6500, debt: 5000, physicalHealth: 70, mentalHealth: 50 },
  'hvac-technician': { cash: 6000, debt: 4000, physicalHealth: 70, mentalHealth: 40 },
  plumber: { cash: 6250, debt: 4500, physicalHealth: 60, mentalHealth: 50 },
  entrepreneur: { cash: 3500, debt: 2000, physicalHealth: 50, mentalHealth: 40 },
  musician: { cash: 2500, debt: 0, physicalHealth: 60, mentalHealth: 70 },
  'content-creator': { cash: 3000, debt: 0, physicalHealth: 60, mentalHealth: 50 },
})
const CITY_HEALTH = Object.freeze({
  metro: { physicalHealth: 0, mentalHealth: -1 },
  suburbia: { physicalHealth: 0, mentalHealth: 0 },
  'small-town': { physicalHealth: 2, mentalHealth: 0 },
})

class TurnResolutionError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'TurnResolutionError'
    this.code = code
  }
}

const clampHealth = (value) => Math.min(100, Math.max(0, value))
const asFiniteNumber = (value, fallback = 0) => (Number.isFinite(value) ? value : fallback)
const assetValue = (asset) => asFiniteNumber(asset?.currentValue, asFiniteNumber(asset?.value, asFiniteNumber(asset?.balance)))
const debtBalance = (debt) => asFiniteNumber(debt?.balance, asFiniteNumber(debt?.amount))

const calculateNetWorth = ({ cash, assets, debts }) =>
  cash + assets.reduce((total, asset) => total + assetValue(asset), 0) - debts.reduce((total, debt) => total + debtBalance(debt), 0)

const normalizePlayerForTurn = (player, index) => {
  const careerId = CAREER_STARTS[player?.careerId || player?.jobId] ? player.careerId || player.jobId : DEFAULT_CAREER_ID
  const cityId = CITY_HEALTH[player?.cityId] ? player.cityId : DEFAULT_CITY_ID
  const career = CAREER_STARTS[careerId]
  const city = CITY_HEALTH[cityId]
  const id = player?.id != null ? String(player.id) : `player-${index + 1}`
  const debtType = DEGREE_CAREERS.has(careerId) ? 'student' : 'training'
  const debts = Array.isArray(player?.debts)
    ? player.debts.map((debt) => ({ ...debt }))
    : career.debt > 0
      ? [
          {
            id: `${id}-starting-debt`,
            type: debtType,
            label: `${careerId} education and training debt`,
            balance: career.debt,
            annualInterestRate: debtType === 'student' ? 0.05 : 0.04,
            minimumPayment: Math.ceil(career.debt * 0.005),
          },
        ]
      : []
  const assets = Array.isArray(player?.assets) ? player.assets.map((asset) => ({ ...asset })) : []
  const cash = asFiniteNumber(player?.cash, career.cash)

  return {
    ...player,
    id,
    age: Number.isInteger(player?.age) && player.age >= 0 ? player.age : 18,
    cityId,
    careerId,
    jobId: careerId,
    cash,
    debts,
    assets,
    netWorth: calculateNetWorth({ cash, assets, debts }),
    physicalHealth: clampHealth(asFiniteNumber(player?.physicalHealth, career.physicalHealth + city.physicalHealth)),
    mentalHealth: clampHealth(asFiniteNumber(player?.mentalHealth, career.mentalHealth + city.mentalHealth)),
    statusEffects: Array.isArray(player?.statusEffects) ? [...player.statusEffects] : [],
    actionHistory: Array.isArray(player?.actionHistory) ? [...player.actionHistory] : [],
  }
}

const normalizeVersion = (value) => (Number.isInteger(value) && value >= 1 ? value : 1)
const normalizeTurnNumber = (value) => (Number.isInteger(value) && value >= 1 ? value : 1)
const normalizeActivePlayerIndex = (value, playerCount) =>
  playerCount > 0 && Number.isInteger(value) && value >= 0 ? value % playerCount : 0

const buildTurnKey = (gameId, expectedVersion) => `${String(gameId)}:v${expectedVersion}`

const findCompletedTurn = (game, turnKey) => {
  const event = (Array.isArray(game?.events) ? game.events : []).find((candidate) => candidate?.turnKey === turnKey)
  if (!event) {
    return null
  }
  const move = (Array.isArray(game?.moveHistory) ? game.moveHistory : []).find((candidate) => candidate?.eventId === event.id)
  return move ? { event, move } : null
}

const validateAdvanceRequest = ({ gameId, game, actionType, expectedVersion }) => {
  if (!gameId || !game) {
    throw new TurnResolutionError('GAME_NOT_FOUND', 'Game not found.')
  }
  if (!Object.hasOwn(ACTION_LABELS, actionType)) {
    throw new TurnResolutionError('INVALID_ACTION', 'The action type must be choose_action or pass.')
  }
  if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
    throw new TurnResolutionError('INVALID_EXPECTED_VERSION', 'A positive expectedVersion is required.')
  }
}

const prepareAdvance = ({ gameId, game, actionType, expectedVersion }) => {
  validateAdvanceRequest({ gameId, game, actionType, expectedVersion })
  const turnKey = buildTurnKey(gameId, expectedVersion)
  const completed = findCompletedTurn(game, turnKey)
  if (completed) {
    if (completed.move.actionType !== actionType) {
      throw new TurnResolutionError('TURN_CONFLICT', 'That game turn was completed with a different action.')
    }
    return { status: 'completed', turnKey, ...completed }
  }
  if (normalizeVersion(game.version) !== expectedVersion) {
    throw new TurnResolutionError('TURN_CONFLICT', 'The game changed before this turn could be completed.')
  }

  const players = Array.isArray(game.players) ? game.players.map(normalizePlayerForTurn) : []
  if (players.length === 0) {
    throw new TurnResolutionError('NO_ACTIVE_PLAYER', 'The game has no active player.')
  }
  const activePlayerIndex = normalizeActivePlayerIndex(game.activePlayerIndex, players.length)
  return {
    status: 'ready',
    turnKey,
    players,
    activePlayerIndex,
    activePlayer: players[activePlayerIndex],
    turnNumber: normalizeTurnNumber(game.turnNumber),
  }
}

const validateGeneratedEvent = (generatedEvent) => {
  const core = validateLifeEvent({
    title: generatedEvent?.title,
    narrative: generatedEvent?.narrative,
    outcome: generatedEvent?.outcome,
    effect: generatedEvent?.effect,
  })
  const source = generatedEvent?.source
  if (
    !source ||
    typeof source !== 'object' ||
    typeof source.publisher !== 'string' ||
    !source.publisher.trim() ||
    typeof source.headline !== 'string' ||
    !source.headline.trim() ||
    (source.publishedAt !== null && typeof source.publishedAt !== 'string')
  ) {
    throw new TurnResolutionError('INVALID_GENERATED_EVENT', 'The generated event source is invalid.')
  }
  if (!['bedrock', 'fallback'].includes(generatedEvent.generationMode)) {
    throw new TurnResolutionError('INVALID_GENERATED_EVENT', 'The generated event mode is invalid.')
  }
  return {
    ...core,
    source: {
      publisher: source.publisher.trim(),
      headline: source.headline.trim(),
      publishedAt: source.publishedAt,
    },
    generationMode: generatedEvent.generationMode,
  }
}

const applyEffect = (player, effect) => {
  const nextPlayer = { ...player }
  if (effect.metric === 'cash') {
    nextPlayer.cash += effect.amount
    nextPlayer.netWorth = calculateNetWorth(nextPlayer)
  } else {
    nextPlayer[effect.metric] = clampHealth(nextPlayer[effect.metric] + effect.amount)
  }
  return nextPlayer
}

const completeAdvance = ({ game, prepared, actionType, generatedEvent, now = Date.now(), eventId = crypto.randomUUID() }) => {
  if (prepared.status !== 'ready') {
    throw new TurnResolutionError('TURN_NOT_READY', 'The turn is not ready to complete.')
  }
  const validatedEvent = validateGeneratedEvent(generatedEvent)
  const event = {
    id: eventId,
    turnKey: prepared.turnKey,
    playerId: prepared.activePlayer.id,
    turnNumber: prepared.turnNumber,
    ...validatedEvent,
    createdAt: now,
  }
  const players = [...prepared.players]
  players[prepared.activePlayerIndex] = applyEffect(prepared.activePlayer, event.effect)
  const nextPlayerIndex = (prepared.activePlayerIndex + 1) % players.length
  const nextTurnNumber = nextPlayerIndex === 0 ? prepared.turnNumber + 1 : prepared.turnNumber
  const move = {
    id: crypto.randomUUID(),
    playerId: prepared.activePlayer.id,
    playerName: prepared.activePlayer.name?.trim() || `Player ${prepared.activePlayerIndex + 1}`,
    turnNumber: prepared.turnNumber,
    actionType,
    actionLabel: ACTION_LABELS[actionType],
    eventId: event.id,
    createdAt: now,
  }

  return {
    game: {
      ...game,
      id: String(game.id),
      version: normalizeVersion(game.version) + 1,
      players,
      turnNumber: nextTurnNumber,
      activePlayerIndex: nextPlayerIndex,
      moveHistory: [...(Array.isArray(game.moveHistory) ? game.moveHistory : []), move],
      events: [...(Array.isArray(game.events) ? game.events : []), event],
      lastUpdated: now,
    },
    event,
  }
}

module.exports = {
  ACTION_LABELS,
  TurnResolutionError,
  applyEffect,
  buildTurnKey,
  calculateNetWorth,
  completeAdvance,
  findCompletedTurn,
  normalizePlayerForTurn,
  normalizeVersion,
  prepareAdvance,
  validateGeneratedEvent,
}
