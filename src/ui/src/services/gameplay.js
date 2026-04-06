import {
  DEFAULT_CITY_ID,
  DEFAULT_EDUCATION_TRACK_ID,
  DEFAULT_JOB_ID,
} from '../utils/gameValidation'
import {
  WIZARD_CAREER_BY_ID,
  WIZARD_CITY_BY_ID,
  WIZARD_TRACK_BY_ID,
} from '../data/wizardVisualCatalog'

export const GAMEPLAY_SCHEMA_VERSION = 1

const CITY_BASELINE_COST = {
  metro: 2400,
  suburbia: 1800,
  'small-town': 1450,
}

const CITY_HEALTH_EFFECTS = {
  metro: { mental: -2, physical: -1 },
  suburbia: { mental: 0, physical: 0 },
  'small-town': { mental: 1, physical: 2 },
}

const TRACK_STARTING_CASH = {
  degree: 7000,
  trades: 9000,
  'self-taught': 8000,
}

const TRACK_HEALTH_EFFECTS = {
  degree: { mental: -1, physical: 0 },
  trades: { mental: 0, physical: 1 },
  'self-taught': { mental: 1, physical: 0 },
}

export const TURN_ACTIONS = [
  {
    id: 'debt-paydown',
    label: 'Debt Paydown',
    description: 'Put extra cash toward debt and ease future pressure.',
    effectText: '-$500 cash, -$500 debt, +1 mental health',
    apply: (player) => ({
      ...player,
      cash: player.cash - 500,
      debt: Math.max(0, player.debt - 500),
      mentalHealth: clampMetric(player.mentalHealth + 1),
    }),
  },
  {
    id: 'family-time',
    label: 'Spend Time With Family & Friends',
    description: 'Trade a little money for recovery and connection.',
    effectText: '-$150 cash, +8 mental health, +2 physical health',
    apply: (player) => ({
      ...player,
      cash: player.cash - 150,
      mentalHealth: clampMetric(player.mentalHealth + 8),
      physicalHealth: clampMetric(player.physicalHealth + 2),
    }),
  },
  {
    id: 'job-training',
    label: 'Job Training',
    description: 'Invest in future earning power at a short-term cost.',
    effectText: '-$300 cash, +$100 monthly income, -1 mental health',
    apply: (player) => ({
      ...player,
      cash: player.cash - 300,
      monthlyIncome: player.monthlyIncome + 100,
      mentalHealth: clampMetric(player.mentalHealth - 1),
    }),
  },
]

export const TURN_ACTIONS_BY_ID = Object.fromEntries(TURN_ACTIONS.map((action) => [action.id, action]))

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const clampMetric = (value) => Math.max(0, Math.min(100, Math.round(value)))

const parseCurrencyAmount = (value) => {
  const match = String(value || '').match(/\$([\d,]+)/)
  if (!match) {
    return 0
  }
  return Number(match[1].replace(/,/g, ''))
}

const calculateNetWorth = (player) => {
  const assets = toNumber(player.assets, 0)
  const investments = toNumber(player.investments, 0)
  return Math.round(toNumber(player.cash, 0) + assets + investments - toNumber(player.debt, 0))
}

const createPlayerId = (gameId, player, index) => {
  if (player?.id != null && String(player.id).trim()) {
    return String(player.id)
  }
  return `${String(gameId)}-player-${index + 1}`
}

const getCityCost = (cityId) => CITY_BASELINE_COST[cityId] ?? CITY_BASELINE_COST[DEFAULT_CITY_ID]

const getCityHealthEffects = (cityId) => CITY_HEALTH_EFFECTS[cityId] ?? CITY_HEALTH_EFFECTS[DEFAULT_CITY_ID]

const getTrackHealthEffects = (trackId) =>
  TRACK_HEALTH_EFFECTS[trackId] ?? TRACK_HEALTH_EFFECTS[DEFAULT_EDUCATION_TRACK_ID]

const normalizePlayerForPlay = (gameId, player, index) => {
  const cityId = player.cityId || DEFAULT_CITY_ID
  const educationTrackId = player.educationTrackId || DEFAULT_EDUCATION_TRACK_ID
  const jobId = player.jobId || DEFAULT_JOB_ID
  const city = WIZARD_CITY_BY_ID[cityId] || WIZARD_CITY_BY_ID[DEFAULT_CITY_ID]
  const track = WIZARD_TRACK_BY_ID[educationTrackId] || WIZARD_TRACK_BY_ID[DEFAULT_EDUCATION_TRACK_ID]
  const career = WIZARD_CAREER_BY_ID[jobId] || WIZARD_CAREER_BY_ID[DEFAULT_JOB_ID]
  const weeklyIncome = parseCurrencyAmount(career?.income)
  const startingDebt = parseCurrencyAmount(career?.debt)
  const startingCash = TRACK_STARTING_CASH[educationTrackId] ?? TRACK_STARTING_CASH[DEFAULT_EDUCATION_TRACK_ID]
  const cityHealth = getCityHealthEffects(cityId)
  const trackHealth = getTrackHealthEffects(educationTrackId)
  const monthlyIncome = toNumber(player.monthlyIncome, weeklyIncome * 4)
  const cash = toNumber(player.cash, startingCash)
  const debt = toNumber(player.debt, startingDebt)
  const assets = toNumber(player.assets, 0)
  const investments = toNumber(player.investments, 0)
  const physicalHealth = clampMetric(toNumber(player.physicalHealth, 58 + cityHealth.physical + trackHealth.physical))
  const mentalHealth = clampMetric(toNumber(player.mentalHealth, 58 + cityHealth.mental + trackHealth.mental))
  const normalized = {
    ...player,
    id: createPlayerId(gameId, player, index),
    name: (player.name || `Player ${index + 1}`).trim(),
    avatar: player.avatar || '',
    cityId,
    cityName: city?.shortName || cityId,
    educationTrackId,
    educationTrackName: track?.name || educationTrackId,
    jobId,
    careerTrack: player.careerTrack || career?.title || null,
    careerName: career?.title || jobId,
    monthlyIncome,
    cash,
    debt,
    assets,
    investments,
    physicalHealth,
    mentalHealth,
    actionHistory: Array.isArray(player.actionHistory) ? player.actionHistory : [],
    statusEffects: Array.isArray(player.statusEffects) ? player.statusEffects : [],
  }

  return {
    ...normalized,
    netWorth: toNumber(player.netWorth, calculateNetWorth(normalized)),
  }
}

export const initializeGameForPlay = (game) => {
  const timestamp = Date.now()
  const players = Array.isArray(game?.players) ? game.players : []
  const normalizedPlayers = players.map((player, index) => normalizePlayerForPlay(game?.id || 'game', player, index))

  return {
    ...game,
    schemaVersion: GAMEPLAY_SCHEMA_VERSION,
    status: game?.status || 'active',
    resumable: true,
    startedAt: game?.startedAt || timestamp,
    createdAt: game?.createdAt || timestamp,
    lastUpdated: timestamp,
    players: normalizedPlayers,
    turnHistory: Array.isArray(game?.turnHistory) ? game.turnHistory : [],
    lastTurnSummary: game?.lastTurnSummary || null,
    playState: {
      view: game?.playState?.view || 'welcome',
      activePlayerIndex: toNumber(game?.playState?.activePlayerIndex, 0),
      monthIndex: Math.max(1, toNumber(game?.playState?.monthIndex, 1)),
      turnNumber: Math.max(1, toNumber(game?.playState?.turnNumber, 1)),
    },
  }
}

export const ensurePlayableGame = (game) => {
  if (!game?.playState || !Array.isArray(game.players)) {
    return initializeGameForPlay(game)
  }

  return {
    ...game,
    schemaVersion: toNumber(game.schemaVersion, GAMEPLAY_SCHEMA_VERSION),
    resumable: game.resumable !== false,
    players: game.players.map((player, index) => normalizePlayerForPlay(game.id || 'game', player, index)),
    turnHistory: Array.isArray(game.turnHistory) ? game.turnHistory : [],
    lastTurnSummary: game.lastTurnSummary || null,
    playState: {
      view: game.playState.view || 'welcome',
      activePlayerIndex: toNumber(game.playState.activePlayerIndex, 0),
      monthIndex: Math.max(1, toNumber(game.playState.monthIndex, 1)),
      turnNumber: Math.max(1, toNumber(game.playState.turnNumber, 1)),
    },
  }
}

const applyBaselineChanges = (player) => {
  const cityHealth = getCityHealthEffects(player.cityId)
  const trackHealth = getTrackHealthEffects(player.educationTrackId)
  const debtPayment = Math.min(player.debt, Math.max(100, Math.round(player.debt * 0.03)))
  const costOfLiving = getCityCost(player.cityId)
  const nextPlayer = {
    ...player,
    cash: player.cash + player.monthlyIncome - costOfLiving - debtPayment,
    debt: Math.max(0, player.debt - debtPayment),
    mentalHealth: clampMetric(player.mentalHealth + cityHealth.mental + trackHealth.mental),
    physicalHealth: clampMetric(player.physicalHealth + cityHealth.physical + trackHealth.physical),
  }

  return {
    player: {
      ...nextPlayer,
      netWorth: calculateNetWorth(nextPlayer),
    },
    deltas: {
      income: player.monthlyIncome,
      costOfLiving,
      debtPayment,
      mentalHealth: cityHealth.mental + trackHealth.mental,
      physicalHealth: cityHealth.physical + trackHealth.physical,
    },
  }
}

export const resolveTurn = (game, actionId) => {
  const playableGame = ensurePlayableGame(game)
  const action = TURN_ACTIONS_BY_ID[actionId]

  if (!action) {
    throw new Error('Unknown turn action')
  }

  const currentIndex = playableGame.playState.activePlayerIndex
  const currentPlayer = playableGame.players[currentIndex]

  if (!currentPlayer) {
    throw new Error('Active player not found')
  }

  const before = {
    cash: currentPlayer.cash,
    debt: currentPlayer.debt,
    netWorth: currentPlayer.netWorth,
    physicalHealth: currentPlayer.physicalHealth,
    mentalHealth: currentPlayer.mentalHealth,
    monthlyIncome: currentPlayer.monthlyIncome,
  }
  const baseline = applyBaselineChanges(currentPlayer)
  const afterAction = action.apply(baseline.player)
  const resolvedPlayer = {
    ...afterAction,
    netWorth: calculateNetWorth(afterAction),
    actionHistory: [
      ...currentPlayer.actionHistory,
      {
        turnNumber: playableGame.playState.turnNumber,
        monthIndex: playableGame.playState.monthIndex,
        actionId: action.id,
        actionLabel: action.label,
      },
    ],
  }
  const nextActivePlayerIndex = (currentIndex + 1) % playableGame.players.length
  const didWrapMonth = nextActivePlayerIndex === 0
  const summary = {
    actingPlayerId: currentPlayer.id,
    actingPlayerName: currentPlayer.name,
    actionId: action.id,
    actionLabel: action.label,
    monthIndex: playableGame.playState.monthIndex,
    turnNumber: playableGame.playState.turnNumber,
    baseline,
    before,
    after: {
      cash: resolvedPlayer.cash,
      debt: resolvedPlayer.debt,
      netWorth: resolvedPlayer.netWorth,
      physicalHealth: resolvedPlayer.physicalHealth,
      mentalHealth: resolvedPlayer.mentalHealth,
      monthlyIncome: resolvedPlayer.monthlyIncome,
    },
    nextPlayerName: playableGame.players[nextActivePlayerIndex]?.name || currentPlayer.name,
    nextPlayerIndex: nextActivePlayerIndex,
  }
  const updatedPlayers = playableGame.players.map((player, index) =>
    index === currentIndex ? resolvedPlayer : player,
  )
  const timestamp = Date.now()

  return {
    ...playableGame,
    players: updatedPlayers,
    lastTurnSummary: summary,
    lastUpdated: timestamp,
    turnHistory: [...playableGame.turnHistory, summary],
    playState: {
      view: 'summary',
      activePlayerIndex: nextActivePlayerIndex,
      monthIndex: didWrapMonth ? playableGame.playState.monthIndex + 1 : playableGame.playState.monthIndex,
      turnNumber: playableGame.playState.turnNumber + 1,
    },
  }
}

export const advanceFromSummary = (game) => {
  const playableGame = ensurePlayableGame(game)
  return {
    ...playableGame,
    lastUpdated: Date.now(),
    playState: {
      ...playableGame.playState,
      view: 'turn',
    },
  }
}

export const beginGameFromWelcome = (game) => {
  const playableGame = ensurePlayableGame(game)
  return {
    ...playableGame,
    lastUpdated: Date.now(),
    playState: {
      ...playableGame.playState,
      view: 'turn',
    },
  }
}

