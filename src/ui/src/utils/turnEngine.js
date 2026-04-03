const CITY_DEFINITIONS = {
  metro: {
    id: 'metro',
    label: 'Metro',
    costOfLivingMultiplier: 1.35,
    taxRate: 0.24,
    opportunityMultiplier: 1.15,
    mentalBaseline: -2,
    physicalBaseline: -1,
  },
  suburbia: {
    id: 'suburbia',
    label: 'Suburbia',
    costOfLivingMultiplier: 1,
    taxRate: 0.18,
    opportunityMultiplier: 1,
    mentalBaseline: 0,
    physicalBaseline: 0,
  },
  'small-town': {
    id: 'small-town',
    label: 'Small Town',
    costOfLivingMultiplier: 0.82,
    taxRate: 0.12,
    opportunityMultiplier: 0.9,
    mentalBaseline: 1,
    physicalBaseline: 2,
  },
}

const CAREER_DEFINITIONS = {
  'degree-track': {
    id: 'degree-track',
    label: 'Degree Track',
    startCash: 1200,
    startDebt: 30000,
    monthlyIncome: 6200,
    mentalBaseline: -1,
    physicalBaseline: 0,
  },
  'trades-track': {
    id: 'trades-track',
    label: 'Trades Track',
    startCash: 2000,
    startDebt: 5000,
    monthlyIncome: 5100,
    mentalBaseline: 0,
    physicalBaseline: -1,
  },
  'street-smart': {
    id: 'street-smart',
    label: 'Street Smart',
    startCash: 1800,
    startDebt: 0,
    monthlyIncome: 4300,
    mentalBaseline: 1,
    physicalBaseline: 0,
  },
}

const ACTION_DEFINITIONS = [
  {
    id: 'study-school',
    label: 'Study or School',
    description: 'Pay now to improve your career trajectory later.',
    upfrontCost: 600,
    recurringCost: 0,
    durationMonths: 1,
    cooldownMonths: 0,
    preview: {
      cash: [-700, -500],
      netWorth: [-700, -500],
      physicalHealth: [-1, 0],
      mentalHealth: [-2, -1],
      riskNotes: ['Raises future income modestly through a temporary study boost.'],
    },
  },
  {
    id: 'job-training',
    label: 'Job Training',
    description: 'Short-term cost for steadier medium-term earnings.',
    upfrontCost: 300,
    recurringCost: 0,
    durationMonths: 1,
    cooldownMonths: 0,
    preview: {
      cash: [-350, -250],
      netWorth: [-350, -250],
      physicalHealth: [0, 0],
      mentalHealth: [-1, 0],
      riskNotes: ['Adds a temporary income boost for the next few turns.'],
    },
  },
  {
    id: 'invest-stocks',
    label: 'Invest in Stocks',
    description: 'Higher upside with more volatility.',
    upfrontCost: 500,
    recurringCost: 0,
    durationMonths: null,
    cooldownMonths: 0,
    preview: {
      cash: [-500, -500],
      netWorth: [-60, 80],
      physicalHealth: [0, 0],
      mentalHealth: [-1, 1],
      riskNotes: ['Stock value can drift up or down each turn.'],
    },
  },
  {
    id: 'invest-bonds',
    label: 'Invest in Bonds',
    description: 'Lower risk and lower expected return.',
    upfrontCost: 400,
    recurringCost: 0,
    durationMonths: null,
    cooldownMonths: 0,
    preview: {
      cash: [-400, -400],
      netWorth: [8, 18],
      physicalHealth: [0, 0],
      mentalHealth: [0, 1],
      riskNotes: ['Bonds add a small but steadier return.'],
    },
  },
  {
    id: 'join-gym',
    label: 'Join Gym',
    description: 'Spend cash to support physical and mental health.',
    upfrontCost: 120,
    recurringCost: 40,
    durationMonths: 3,
    cooldownMonths: 0,
    preview: {
      cash: [-160, -120],
      netWorth: [-160, -120],
      physicalHealth: [3, 5],
      mentalHealth: [1, 2],
      riskNotes: ['Adds a short health boost over future turns.'],
    },
  },
  {
    id: 'spend-time-with-family-friends',
    label: 'Spend Time with Family or Friends',
    description: 'Modest cost for a reliable mental health lift.',
    upfrontCost: 80,
    recurringCost: 0,
    durationMonths: 1,
    cooldownMonths: 0,
    preview: {
      cash: [-100, -60],
      netWorth: [-100, -60],
      physicalHealth: [0, 1],
      mentalHealth: [4, 6],
      riskNotes: ['Helps offset stress from debt or setbacks.'],
    },
  },
  {
    id: 'debt-paydown',
    label: 'Debt Paydown',
    description: 'Trade cash now for lower future debt pressure.',
    upfrontCost: 600,
    recurringCost: 0,
    durationMonths: 1,
    cooldownMonths: 0,
    preview: {
      cash: [-600, -600],
      netWorth: [0, 0],
      physicalHealth: [0, 0],
      mentalHealth: [1, 2],
      riskNotes: ['Reduces future interest and stress.'],
    },
  },
  {
    id: 'side-gig',
    label: 'Side Gig',
    description: 'Extra income now with some health tradeoff.',
    upfrontCost: 0,
    recurringCost: 0,
    durationMonths: 1,
    cooldownMonths: 0,
    preview: {
      cash: [350, 550],
      netWorth: [350, 550],
      physicalHealth: [-2, -1],
      mentalHealth: [-2, -1],
      riskNotes: ['Can relieve cash pressure but increases fatigue.'],
    },
  },
]

const ACTION_DEFINITION_BY_ID = Object.fromEntries(ACTION_DEFINITIONS.map((action) => [action.id, action]))

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const roundCurrency = (value) => Math.round(value * 100) / 100

const normalizeGameStatus = (status) => {
  if (status === 'active' || status === 'turn_ready' || status === 'in_progress') {
    return 'turn_ready'
  }
  if (status === 'paused' || status === 'handoff') {
    return 'handoff'
  }
  if (status === 'completed') {
    return 'completed'
  }
  return 'turn_ready'
}

const createHash = (value) => {
  let hash = 2166136261
  const input = String(value)
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const createRng = (...parts) => {
  let state = createHash(parts.join('|')) || 1
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

const mapEducationTrackToCareerId = (educationTrackId, jobId) => {
  if (educationTrackId === 'degree') {
    return 'degree-track'
  }
  if (educationTrackId === 'trades') {
    return 'trades-track'
  }
  if (educationTrackId === 'self-taught') {
    return 'street-smart'
  }

  if (['software-engineer', 'registered-nurse', 'financial-analyst'].includes(jobId)) {
    return 'degree-track'
  }
  if (['electrician', 'hvac-technician', 'plumber'].includes(jobId)) {
    return 'trades-track'
  }
  return 'street-smart'
}

const sumBy = (collection, getValue) =>
  collection.reduce((total, item) => total + Number(getValue(item) || 0), 0)

const calculateNetWorth = (player) =>
  roundCurrency(Number(player.cash || 0) + sumBy(player.assets, (asset) => asset.value) - sumBy(player.debts, (debt) => debt.balance))

const normalizeStatusEffect = (effect, index = 0) => ({
  id: String(effect?.id ?? `effect-${index + 1}`),
  type: String(effect?.type ?? 'modifier'),
  label: String(effect?.label ?? 'Modifier'),
  remainingTurns: Math.max(0, Number(effect?.remainingTurns ?? 0)),
  modifiers: {
    income: Number(effect?.modifiers?.income ?? 0),
    physicalHealth: Number(effect?.modifiers?.physicalHealth ?? 0),
    mentalHealth: Number(effect?.modifiers?.mentalHealth ?? 0),
  },
})

const normalizeDebt = (debt, index = 0) => ({
  id: String(debt?.id ?? `debt-${index + 1}`),
  label: String(debt?.label ?? 'Debt'),
  balance: roundCurrency(Number(debt?.balance ?? 0)),
  interestRate: Number(debt?.interestRate ?? 0.015),
  minimumPaymentRate: Number(debt?.minimumPaymentRate ?? 0.03),
})

const normalizeAsset = (asset, index = 0) => ({
  id: String(asset?.id ?? `asset-${index + 1}`),
  label: String(asset?.label ?? 'Asset'),
  type: String(asset?.type ?? 'other'),
  value: roundCurrency(Number(asset?.value ?? 0)),
})

export const normalizePlayerState = (player, index = 0) => {
  const careerId = player?.careerId || mapEducationTrackToCareerId(player?.educationTrackId, player?.jobId)
  const career = CAREER_DEFINITIONS[careerId] || CAREER_DEFINITIONS['street-smart']
  const debts = Array.isArray(player?.debts) && player.debts.length > 0
    ? player.debts.map(normalizeDebt)
    : career.startDebt > 0
      ? [
          {
            id: `debt-${index + 1}`,
            label: careerId === 'degree-track' ? 'Student Debt' : 'Training Debt',
            balance: career.startDebt,
            interestRate: 0.015,
            minimumPaymentRate: 0.03,
          },
        ]
      : []
  const assets = Array.isArray(player?.assets) ? player.assets.map(normalizeAsset) : []
  const statusEffects = Array.isArray(player?.statusEffects) ? player.statusEffects.map(normalizeStatusEffect) : []
  const normalized = {
    id: String(player?.id ?? `player-${index + 1}`),
    name: String(player?.name ?? `Player ${index + 1}`).trim() || `Player ${index + 1}`,
    avatar: String(player?.avatar ?? 'fox'),
    age: Number(player?.age ?? 18),
    cityId: String(player?.cityId ?? 'suburbia'),
    educationTrackId: String(player?.educationTrackId ?? 'self-taught'),
    jobId: String(player?.jobId ?? 'content-creator'),
    careerId,
    cash: roundCurrency(Number(player?.cash ?? career.startCash)),
    debts,
    assets,
    netWorth: 0,
    physicalHealth: clamp(Number(player?.physicalHealth ?? 100), 0, 100),
    mentalHealth: clamp(Number(player?.mentalHealth ?? 100), 0, 100),
    statusEffects,
    actionHistory: Array.isArray(player?.actionHistory) ? player.actionHistory : [],
  }
  normalized.netWorth = calculateNetWorth(normalized)
  return normalized
}

const createAvailableActions = () => ACTION_DEFINITIONS.map((action) => ({ ...action }))

const buildHandoffState = (game) => {
  if (game.status !== 'handoff') {
    return null
  }
  const fromPlayerIndex =
    typeof game.lastTurnResolution?.playerId === 'string'
      ? game.players.findIndex((player) => player.id === game.lastTurnResolution.playerId)
      : -1
  const toPlayer = game.players[game.activePlayerIndex] || game.players[0] || null
  return {
    fromPlayerId: fromPlayerIndex >= 0 ? game.players[fromPlayerIndex].id : game.players[0]?.id ?? 'player-1',
    toPlayerId: toPlayer?.id ?? 'player-1',
    toPlayerName: toPlayer?.name ?? 'Player 1',
    month: Number(game.currentMonth ?? 1),
    readyAt: Number(game.lastUpdated ?? Date.now()),
  }
}

export const normalizeGameState = (game) => {
  const players = Array.isArray(game?.players) ? game.players.map(normalizePlayerState) : []
  const activePlayerIndex = clamp(Number(game?.activePlayerIndex ?? 0), 0, Math.max(players.length - 1, 0))
  const normalized = {
    id: String(game?.id ?? `game-${Date.now()}`),
    name: String(game?.name ?? 'Family Game Night'),
    status: normalizeGameStatus(game?.status),
    createdAt: Number(game?.createdAt ?? Date.now()),
    lastUpdated: Number(game?.lastUpdated ?? Date.now()),
    randomSeed: String(game?.randomSeed ?? `seed-${game?.id ?? Date.now()}`),
    version: Number(game?.version ?? 1),
    currentMonth: Math.max(1, Number(game?.currentMonth ?? 1)),
    activePlayerIndex,
    players,
    availableActions: createAvailableActions(),
    lastTurnResolution: game?.lastTurnResolution ?? null,
    pendingHandoff: game?.pendingHandoff ?? null,
  }
  normalized.pendingHandoff = buildHandoffState(normalized) || normalized.pendingHandoff
  return normalized
}

const getFinancialStressModifier = (player) => {
  const debtTotal = sumBy(player.debts, (debt) => debt.balance)
  if (player.cash < 500 || debtTotal > 20000) {
    return -2
  }
  if (debtTotal > 5000) {
    return -1
  }
  return 0
}

const getEventCandidates = (player) => [
  {
    id: 'minor-illness',
    label: 'Minor Illness',
    weight: player.physicalHealth < 50 ? 3 : 1,
    apply: () => ({
      physicalHealth: -4,
      mentalHealth: -1,
      cash: -75,
      kind: 'unintended',
      explanation: {
        baseChance: 'Moderate',
        activeModifiers: player.physicalHealth < 50 ? ['Lower physical health increased the chance.'] : ['No extra risk modifiers were active.'],
      },
      message: 'A minor illness cost time, energy, and a bit of money.',
    }),
  },
  {
    id: 'surprise-expense',
    label: 'Surprise Expense',
    weight: player.cash < 800 ? 3 : 1,
    apply: () => ({
      cash: -180,
      mentalHealth: -2,
      kind: 'unintended',
      explanation: {
        baseChance: 'Moderate',
        activeModifiers: player.cash < 800 ? ['Low cash made setbacks feel riskier.'] : ['No extra financial stress modifier was active.'],
      },
      message: 'An unexpected bill hit this month.',
    }),
  },
  {
    id: 'bonus-opportunity',
    label: 'Bonus Opportunity',
    weight: player.mentalHealth > 60 ? 2 : 1,
    apply: () => ({
      cash: 220,
      mentalHealth: 1,
      kind: 'intended',
      explanation: {
        baseChance: 'Low',
        activeModifiers: player.mentalHealth > 60 ? ['Higher mental health made opportunity easier to spot.'] : ['No extra modifier was active.'],
      },
      message: 'A small opportunity added extra cash this month.',
    }),
  },
  {
    id: 'burnout-warning',
    label: 'Burnout Warning',
    weight: player.mentalHealth < 45 ? 3 : 1,
    apply: () => ({
      physicalHealth: -2,
      mentalHealth: -4,
      cash: -120,
      kind: 'unintended',
      explanation: {
        baseChance: 'Moderate',
        activeModifiers: player.mentalHealth < 45 ? ['Lower mental health increased burnout risk.'] : ['No extra modifier was active.'],
      },
      message: 'Stress caught up with you and cut into your month.',
    }),
  },
  {
    id: 'calm-month',
    label: 'Calm Month',
    weight: 2,
    apply: () => ({
      physicalHealth: 1,
      mentalHealth: 2,
      cash: 0,
      kind: 'intended',
      explanation: {
        baseChance: 'Moderate',
        activeModifiers: ['A calm month is always possible.'],
      },
      message: 'Nothing dramatic happened, which helped you recover a little.',
    }),
  },
]

const pickWeightedEvent = (player, random) => {
  const candidates = getEventCandidates(player)
  const totalWeight = sumBy(candidates, (candidate) => candidate.weight)
  let target = random() * totalWeight
  for (const candidate of candidates) {
    target -= candidate.weight
    if (target <= 0) {
      return candidate
    }
  }
  return candidates[candidates.length - 1]
}

const applyAction = (player, actionId) => {
  switch (actionId) {
    case 'study-school':
      return {
        cash: -600,
        physicalHealth: 0,
        mentalHealth: -2,
        assets: [],
        debts: [{ label: 'Tuition Debt', balanceDelta: 250 }],
        statusEffects: [
          {
            id: `study-boost-${Date.now()}`,
            type: 'income',
            label: 'Study Boost',
            remainingTurns: 3,
            modifiers: { income: 180, physicalHealth: 0, mentalHealth: 0 },
          },
        ],
        message: 'Studying cost money now but improved future income potential.',
      }
    case 'job-training':
      return {
        cash: -300,
        physicalHealth: 0,
        mentalHealth: -1,
        assets: [],
        debts: [],
        statusEffects: [
          {
            id: `training-boost-${Date.now()}`,
            type: 'income',
            label: 'Training Boost',
            remainingTurns: 3,
            modifiers: { income: 140, physicalHealth: 0, mentalHealth: 0 },
          },
        ],
        message: 'Training sharpened your earning power for the next few turns.',
      }
    case 'invest-stocks':
      return {
        cash: -500,
        physicalHealth: 0,
        mentalHealth: 0,
        assets: [{ type: 'stocks', value: 500, label: 'Stock Fund' }],
        debts: [],
        statusEffects: [],
        message: 'You bought stocks for long-term upside and short-term volatility.',
      }
    case 'invest-bonds':
      return {
        cash: -400,
        physicalHealth: 0,
        mentalHealth: 1,
        assets: [{ type: 'bonds', value: 400, label: 'Bond Fund' }],
        debts: [],
        statusEffects: [],
        message: 'You added bonds for steadier growth.',
      }
    case 'join-gym':
      return {
        cash: -120,
        physicalHealth: 4,
        mentalHealth: 2,
        assets: [],
        debts: [],
        statusEffects: [
          {
            id: `gym-boost-${Date.now()}`,
            type: 'health',
            label: 'Gym Routine',
            remainingTurns: 2,
            modifiers: { income: 0, physicalHealth: 1, mentalHealth: 1 },
          },
        ],
        message: 'The gym improved both your body and mood.',
      }
    case 'spend-time-with-family-friends':
      return {
        cash: -80,
        physicalHealth: 1,
        mentalHealth: 5,
        assets: [],
        debts: [],
        statusEffects: [],
        message: 'Time with people you care about restored some energy.',
      }
    case 'debt-paydown':
      return {
        cash: -600,
        physicalHealth: 0,
        mentalHealth: 2,
        assets: [],
        debts: [{ paydown: 600 }],
        statusEffects: [],
        message: 'Paying down debt reduced future pressure.',
      }
    case 'side-gig':
      return {
        cash: 480,
        physicalHealth: -1,
        mentalHealth: -2,
        assets: [],
        debts: [],
        statusEffects: [],
        message: 'The side gig brought in cash but added fatigue.',
      }
    default:
      throw new Error('Unknown action')
  }
}

const decrementStatusEffects = (statusEffects) =>
  statusEffects
    .map((effect) => ({
      ...effect,
      remainingTurns: Math.max(0, Number(effect.remainingTurns || 0) - 1),
    }))
    .filter((effect) => effect.remainingTurns > 0)

const buildMetricDelta = (metric, before, after) => ({
  metric,
  before: roundCurrency(before),
  after: roundCurrency(after),
  delta: roundCurrency(after - before),
})

const buildTurnSnapshot = (player) => ({
  playerId: player.id,
  cash: roundCurrency(player.cash),
  debt: roundCurrency(sumBy(player.debts, (debt) => debt.balance)),
  netWorth: roundCurrency(player.netWorth),
  physicalHealth: player.physicalHealth,
  mentalHealth: player.mentalHealth,
})

export const advanceTurnState = (gameInput, payload = {}) => {
  const game = normalizeGameState(gameInput)
  const player = game.players[game.activePlayerIndex]
  if (!player) {
    throw new Error('Active player not found')
  }

  if (game.status !== 'turn_ready') {
    throw new Error('Game is not ready for a turn')
  }
  if (payload.playerId !== player.id) {
    throw new Error('This is not the active player turn')
  }
  if (Number(payload.version) !== Number(game.version)) {
    throw new Error('Game version is out of date')
  }

  const actionDefinition = ACTION_DEFINITION_BY_ID[payload.actionId]
  if (!actionDefinition) {
    throw new Error('Unknown action')
  }

  const random = createRng(game.randomSeed, game.version, game.currentMonth, player.id, payload.actionId)
  const city = CITY_DEFINITIONS[player.cityId] || CITY_DEFINITIONS.suburbia
  const career = CAREER_DEFINITIONS[player.careerId] || CAREER_DEFINITIONS['street-smart']
  const preTurnSnapshot = buildTurnSnapshot(player)
  const workingPlayer = {
    ...player,
    debts: player.debts.map((debt) => ({ ...debt })),
    assets: player.assets.map((asset) => ({ ...asset })),
    statusEffects: player.statusEffects.map((effect) => ({ ...effect, modifiers: { ...effect.modifiers } })),
    actionHistory: [...player.actionHistory],
  }

  const phases = []
  const intendedOutcomes = []
  const unintendedOutcomes = []

  const incomeBoost = sumBy(workingPlayer.statusEffects, (effect) => effect.modifiers?.income)
  const income = roundCurrency(career.monthlyIncome * city.opportunityMultiplier + incomeBoost)
  const taxes = roundCurrency(income * city.taxRate)
  const recurringCosts = roundCurrency(1200 * city.costOfLivingMultiplier)
  let debtInterest = 0
  let debtMinimums = 0

  workingPlayer.debts = workingPlayer.debts.map((debt) => {
    const interest = roundCurrency(debt.balance * debt.interestRate)
    const minimum = roundCurrency(Math.max(50, debt.balance * debt.minimumPaymentRate))
    debtInterest += interest
    debtMinimums += minimum
    return {
      ...debt,
      balance: roundCurrency(Math.max(0, debt.balance + interest - minimum)),
    }
  })

  workingPlayer.assets = workingPlayer.assets.map((asset) => {
    const drift = asset.type === 'stocks'
      ? roundCurrency((random() - 0.35) * 80)
      : asset.type === 'bonds'
        ? roundCurrency(8 + random() * 12)
        : 0
    return {
      ...asset,
      value: roundCurrency(Math.max(0, asset.value + drift)),
    }
  })

  const cashBeforeFinance = workingPlayer.cash
  workingPlayer.cash = roundCurrency(workingPlayer.cash + income - taxes - recurringCosts - debtMinimums)
  workingPlayer.netWorth = calculateNetWorth(workingPlayer)
  phases.push({
    id: 'net-worth',
    label: 'Net Worth Changes',
    deltas: [
      buildMetricDelta('cash', cashBeforeFinance, workingPlayer.cash),
      {
        metric: 'income',
        before: 0,
        after: income,
        delta: income,
      },
      {
        metric: 'costs',
        before: 0,
        after: roundCurrency(taxes + recurringCosts + debtMinimums),
        delta: roundCurrency(-(taxes + recurringCosts + debtMinimums)),
      },
      {
        metric: 'debtInterest',
        before: 0,
        after: debtInterest,
        delta: roundCurrency(-debtInterest),
      },
      buildMetricDelta('netWorth', preTurnSnapshot.netWorth, workingPlayer.netWorth),
    ],
  })

  const physicalBeforeHealth = workingPlayer.physicalHealth
  const mentalBeforeHealth = workingPlayer.mentalHealth
  const stressModifier = getFinancialStressModifier(workingPlayer)
  const healthEffectPhysical =
    city.physicalBaseline + career.physicalBaseline + stressModifier + sumBy(workingPlayer.statusEffects, (effect) => effect.modifiers?.physicalHealth)
  const healthEffectMental =
    city.mentalBaseline + career.mentalBaseline + stressModifier + sumBy(workingPlayer.statusEffects, (effect) => effect.modifiers?.mentalHealth)
  workingPlayer.physicalHealth = clamp(workingPlayer.physicalHealth + healthEffectPhysical, 0, 100)
  workingPlayer.mentalHealth = clamp(workingPlayer.mentalHealth + healthEffectMental, 0, 100)
  phases.push({
    id: 'health',
    label: 'Physical and Mental Health Updates',
    deltas: [
      buildMetricDelta('physicalHealth', physicalBeforeHealth, workingPlayer.physicalHealth),
      buildMetricDelta('mentalHealth', mentalBeforeHealth, workingPlayer.mentalHealth),
    ],
  })

  const chosenEvent = pickWeightedEvent(workingPlayer, random)
  const eventOutcome = chosenEvent.apply()
  const eventCashDelta = Number(eventOutcome.cash ?? 0)
  const eventPhysicalDelta = Number(eventOutcome.physicalHealth ?? 0)
  const eventMentalDelta = Number(eventOutcome.mentalHealth ?? 0)
  const cashBeforeEvent = workingPlayer.cash
  const physicalBeforeEvent = workingPlayer.physicalHealth
  const mentalBeforeEvent = workingPlayer.mentalHealth
  workingPlayer.cash = roundCurrency(workingPlayer.cash + eventCashDelta)
  workingPlayer.physicalHealth = clamp(workingPlayer.physicalHealth + eventPhysicalDelta, 0, 100)
  workingPlayer.mentalHealth = clamp(workingPlayer.mentalHealth + eventMentalDelta, 0, 100)
  if (eventOutcome.kind === 'intended') {
    intendedOutcomes.push({
      source: chosenEvent.label,
      description: eventOutcome.message,
      explanation: eventOutcome.explanation,
    })
  } else {
    unintendedOutcomes.push({
      source: chosenEvent.label,
      description: eventOutcome.message,
      explanation: eventOutcome.explanation,
    })
  }
  phases.push({
    id: 'event',
    label: 'Event Resolution',
    deltas: [
      buildMetricDelta('cash', cashBeforeEvent, workingPlayer.cash),
      buildMetricDelta('physicalHealth', physicalBeforeEvent, workingPlayer.physicalHealth),
      buildMetricDelta('mentalHealth', mentalBeforeEvent, workingPlayer.mentalHealth),
    ],
  })

  const actionResult = applyAction(workingPlayer, payload.actionId)
  const actionCashDelta = Number(actionResult.cash ?? 0)
  const actionPhysicalDelta = Number(actionResult.physicalHealth ?? 0)
  const actionMentalDelta = Number(actionResult.mentalHealth ?? 0)
  const cashBeforeAction = workingPlayer.cash
  const physicalBeforeAction = workingPlayer.physicalHealth
  const mentalBeforeAction = workingPlayer.mentalHealth
  workingPlayer.cash = roundCurrency(workingPlayer.cash + actionCashDelta)
  workingPlayer.physicalHealth = clamp(workingPlayer.physicalHealth + actionPhysicalDelta, 0, 100)
  workingPlayer.mentalHealth = clamp(workingPlayer.mentalHealth + actionMentalDelta, 0, 100)
  workingPlayer.assets = [...workingPlayer.assets, ...actionResult.assets.map((asset, index) => normalizeAsset(asset, workingPlayer.assets.length + index))]
  for (const debtChange of actionResult.debts) {
    if (typeof debtChange.balanceDelta === 'number') {
      const existingDebt = workingPlayer.debts[0]
      if (existingDebt) {
        existingDebt.balance = roundCurrency(existingDebt.balance + debtChange.balanceDelta)
      } else {
        workingPlayer.debts.push(normalizeDebt({ label: debtChange.label, balance: debtChange.balanceDelta }))
      }
    }
    if (typeof debtChange.paydown === 'number' && workingPlayer.debts[0]) {
      workingPlayer.debts[0].balance = roundCurrency(Math.max(0, workingPlayer.debts[0].balance - debtChange.paydown))
    }
  }
  workingPlayer.statusEffects = decrementStatusEffects(workingPlayer.statusEffects).concat(
    actionResult.statusEffects.map((effect, index) => normalizeStatusEffect(effect, workingPlayer.statusEffects.length + index)),
  )
  intendedOutcomes.push({
    source: actionDefinition.label,
    description: actionResult.message,
  })
  workingPlayer.netWorth = calculateNetWorth(workingPlayer)
  workingPlayer.actionHistory.push({
    turn: game.currentMonth,
    actionId: actionDefinition.id,
    actionLabel: actionDefinition.label,
    takenAt: Date.now(),
  })
  phases.push({
    id: 'action',
    label: 'Player Action',
    deltas: [
      buildMetricDelta('cash', cashBeforeAction, workingPlayer.cash),
      buildMetricDelta('physicalHealth', physicalBeforeAction, workingPlayer.physicalHealth),
      buildMetricDelta('mentalHealth', mentalBeforeAction, workingPlayer.mentalHealth),
      buildMetricDelta('netWorth', preTurnSnapshot.netWorth, workingPlayer.netWorth),
    ],
  })

  const nextActivePlayerIndex = (game.activePlayerIndex + 1) % game.players.length
  const wrappedToNextMonth = nextActivePlayerIndex === 0
  const nextMonth = wrappedToNextMonth ? game.currentMonth + 1 : game.currentMonth
  const completedAt = Date.now()
  const updatedPlayers = game.players.map((currentPlayer, index) =>
    index === game.activePlayerIndex ? workingPlayer : currentPlayer,
  )
  const postTurnSnapshot = buildTurnSnapshot(workingPlayer)
  const turnResolution = {
    turnId: `${game.id}-turn-${game.version}`,
    gameId: game.id,
    playerId: player.id,
    month: game.currentMonth,
    preTurnSnapshot,
    phases,
    actionChoice: {
      actionId: actionDefinition.id,
      label: actionDefinition.label,
    },
    summary: {
      headline: `${player.name} finished month ${game.currentMonth} with ${actionDefinition.label}.`,
      keyChanges: [
        buildMetricDelta('cash', preTurnSnapshot.cash, postTurnSnapshot.cash),
        buildMetricDelta('debt', preTurnSnapshot.debt, postTurnSnapshot.debt),
        buildMetricDelta('netWorth', preTurnSnapshot.netWorth, postTurnSnapshot.netWorth),
        buildMetricDelta('physicalHealth', preTurnSnapshot.physicalHealth, postTurnSnapshot.physicalHealth),
        buildMetricDelta('mentalHealth', preTurnSnapshot.mentalHealth, postTurnSnapshot.mentalHealth),
      ],
      intendedOutcomes,
      unintendedOutcomes,
      eventLabel: chosenEvent.label,
    },
    postTurnSnapshot,
    nextActivePlayerIndex,
    wrappedToNextMonth,
    completedAt,
  }

  const updatedGame = normalizeGameState({
    ...game,
    status: 'handoff',
    players: updatedPlayers,
    activePlayerIndex: nextActivePlayerIndex,
    currentMonth: nextMonth,
    version: game.version + 1,
    lastUpdated: completedAt,
    lastTurnResolution: turnResolution,
  })
  updatedGame.pendingHandoff = {
    fromPlayerId: player.id,
    toPlayerId: updatedGame.players[nextActivePlayerIndex]?.id ?? player.id,
    toPlayerName: updatedGame.players[nextActivePlayerIndex]?.name ?? player.name,
    month: updatedGame.currentMonth,
    readyAt: completedAt,
  }

  return {
    game: updatedGame,
    turnResolution,
  }
}

export const beginNextTurnState = (gameInput) => {
  const game = normalizeGameState(gameInput)
  return normalizeGameState({
    ...game,
    status: 'turn_ready',
    pendingHandoff: null,
    lastUpdated: Date.now(),
  })
}

export const createInitialGameState = ({ id, name, players, randomSeed }) => {
  const timestamp = Date.now()
  return normalizeGameState({
    id,
    name,
    status: 'turn_ready',
    createdAt: timestamp,
    lastUpdated: timestamp,
    randomSeed: randomSeed ?? `seed-${timestamp}`,
    version: 1,
    currentMonth: 1,
    activePlayerIndex: 0,
    players,
    lastTurnResolution: null,
    pendingHandoff: null,
  })
}
