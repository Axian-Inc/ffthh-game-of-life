import { WIZARD_CAREER_BY_ID, WIZARD_CITY_BY_ID } from '../data/wizardVisualCatalog'

const BASE_LIVING_COST = 1650
const STOCK_RETURN_RATE = 0.03
const BOND_RETURN_RATE = 0.01
const DEBT_INTEREST_RATE = 0.012
const MIN_DEBT_PAYMENT = 120
const GYM_MONTHLY_DUES = 45

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum)

const roundCurrency = (value) => Math.round(value)

const parseCurrency = (value) => {
  const match = String(value || '').match(/-?\$([\d,]+)/)
  return match ? Number(match[1].replace(/,/g, '')) : 0
}

const parseIncome = (value) => parseCurrency(String(value || '').replace('/wk', ''))

const parseShorthand = (value) => {
  const matches = String(value || '').match(/P(\d+)\s+M(\d+)\s+E(\d+)/)
  if (!matches) {
    return { physical: 5, mental: 5, earnings: 5 }
  }

  return {
    physical: Number(matches[1]),
    mental: Number(matches[2]),
    earnings: Number(matches[3]),
  }
}

const createSeedFromText = (value) => {
  const input = String(value || 'life')
  let seed = 0
  for (let index = 0; index < input.length; index += 1) {
    seed = (seed * 31 + input.charCodeAt(index)) >>> 0
  }
  return seed || 123456789
}

const nextRandom = (state) => {
  const nextState = (state * 1664525 + 1013904223) >>> 0
  return {
    nextState,
    value: nextState / 4294967296,
  }
}

const getCityRule = (cityId) => {
  switch (cityId) {
    case 'metro':
      return {
        id: 'metro',
        label: WIZARD_CITY_BY_ID.metro?.name || 'Metro City',
        costOfLivingMultiplier: 1.5,
        mentalBaseline: -1,
        physicalBaseline: 0,
        opportunityBonus: 0.08,
      }
    case 'small-town':
      return {
        id: 'small-town',
        label: WIZARD_CITY_BY_ID['small-town']?.name || 'Small Town',
        costOfLivingMultiplier: 0.8,
        mentalBaseline: 1,
        physicalBaseline: 2,
        opportunityBonus: -0.04,
      }
    case 'suburbia':
    default:
      return {
        id: 'suburbia',
        label: WIZARD_CITY_BY_ID.suburbia?.name || 'Suburbia',
        costOfLivingMultiplier: 1,
        mentalBaseline: 0,
        physicalBaseline: 0,
        opportunityBonus: 0,
      }
  }
}

const getCareerRule = (jobId) => {
  const career = WIZARD_CAREER_BY_ID[jobId]
  const shorthand = parseShorthand(career?.shorthand)

  return {
    id: jobId,
    label: career?.title || 'Career',
    monthlyIncome: parseIncome(career?.income) * 4,
    startDebt: parseCurrency(career?.debt),
    physicalBias: shorthand.physical - 5,
    mentalBias: shorthand.mental - 5,
    earningsBias: shorthand.earnings - 5,
  }
}

const buildPlayerExpenses = (player) => {
  const city = getCityRule(player.cityId)
  const gymDues = player.statusEffects?.some((effect) => effect.id === 'gym-membership') ? GYM_MONTHLY_DUES : 0
  return roundCurrency(BASE_LIVING_COST * city.costOfLivingMultiplier + gymDues)
}

const calculateNetWorth = (player) =>
  roundCurrency((player.cash || 0) + (player.stocks || 0) + (player.bonds || 0) - (player.debt || 0))

const summarizePlayer = (player) => ({
  cash: player.cash,
  debt: player.debt,
  stocks: player.stocks,
  bonds: player.bonds,
  netWorth: player.netWorth,
  physicalHealth: player.physicalHealth,
  mentalHealth: player.mentalHealth,
  cityId: player.cityId,
  pendingCityId: player.pendingCityId || null,
})

const createPlayerState = (player, index) => {
  const city = getCityRule(player.cityId)
  const career = getCareerRule(player.jobId)
  const startCash = roundCurrency(5000 + career.monthlyIncome * 0.35 + career.earningsBias * 200)
  const physicalHealth = clamp(58 + career.physicalBias * 5 + city.physicalBaseline * 2, 0, 100)
  const mentalHealth = clamp(58 + career.mentalBias * 5 + city.mentalBaseline * 3, 0, 100)

  const playerState = {
    id: player.id || `player-${index + 1}`,
    name: (player.name || `Player ${index + 1}`).trim(),
    avatar: player.avatar || '',
    cityId: player.cityId || 'suburbia',
    educationTrackId: player.educationTrackId || '',
    jobId: player.jobId || '',
    careerTrack: player.careerTrack || null,
    cash: startCash,
    debt: career.startDebt,
    stocks: 0,
    bonds: 0,
    netWorth: 0,
    physicalHealth,
    mentalHealth,
    monthlyIncome: career.monthlyIncome,
    monthlyExpenses: 0,
    statusEffects: [],
    actionHistory: [],
    pendingCityId: null,
  }

  playerState.monthlyExpenses = buildPlayerExpenses(playerState)
  playerState.netWorth = calculateNetWorth(playerState)
  return playerState
}

const normalizePlayerState = (player, index) => {
  if (typeof player?.cash !== 'number' || typeof player?.mentalHealth !== 'number') {
    return createPlayerState(player, index)
  }

  const normalized = {
    ...player,
    id: player.id || `player-${index + 1}`,
    name: (player.name || `Player ${index + 1}`).trim(),
    stocks: typeof player.stocks === 'number' ? player.stocks : 0,
    bonds: typeof player.bonds === 'number' ? player.bonds : 0,
    debt: typeof player.debt === 'number' ? player.debt : 0,
    statusEffects: Array.isArray(player.statusEffects) ? player.statusEffects : [],
    actionHistory: Array.isArray(player.actionHistory) ? player.actionHistory : [],
    pendingCityId: player.pendingCityId || null,
  }

  normalized.monthlyIncome =
    typeof normalized.monthlyIncome === 'number' ? normalized.monthlyIncome : getCareerRule(normalized.jobId).monthlyIncome
  normalized.monthlyExpenses =
    typeof normalized.monthlyExpenses === 'number' ? normalized.monthlyExpenses : buildPlayerExpenses(normalized)
  normalized.netWorth =
    typeof normalized.netWorth === 'number' ? normalized.netWorth : calculateNetWorth(normalized)

  return normalized
}

export const initializeGameState = (game) => {
  if (!game) {
    return null
  }

  const players = Array.isArray(game.players) ? game.players.map((player, index) => normalizePlayerState(player, index)) : []
  const randomSeed = typeof game.randomSeed === 'number' ? game.randomSeed : createSeedFromText(`${game.id}:${game.name}`)
  const randomState = typeof game.randomState === 'number' ? game.randomState : randomSeed

  return {
    ...game,
    status: game.status || 'active',
    resumable: game.resumable ?? true,
    players,
    activePlayerIndex: typeof game.activePlayerIndex === 'number' ? game.activePlayerIndex % Math.max(players.length, 1) : 0,
    turnNumber: typeof game.turnNumber === 'number' ? game.turnNumber : 1,
    startedAt: game.startedAt ?? game.createdAt ?? Date.now(),
    lastTurnAt: game.lastTurnAt ?? null,
    phase: game.phase || 'turn-start',
    turnHistory: Array.isArray(game.turnHistory) ? game.turnHistory : [],
    randomSeed,
    randomState,
  }
}

const buildActionDefinitions = (game, player) => {
  const currentCity = getCityRule(player.cityId)
  const pendingLabel = player.pendingCityId ? getCityRule(player.pendingCityId).label : null

  return [
    {
      id: 'skip-action',
      label: 'Skip this month',
      summary: 'Keep the month simple and carry no additional cost.',
      detail: 'No direct effect. Good when cash is tight.',
      isAvailable: true,
      execute: (draft) => ({
        player: draft,
        intended: ['Skipped the action phase.'],
        unintended: [],
      }),
    },
    {
      id: 'side-gig',
      label: 'Take a side gig',
      summary: 'Earn extra cash now at the cost of some mental energy.',
      detail: '+$450 cash, -2 mental health.',
      isAvailable: true,
      execute: (draft) => ({
        player: {
          ...draft,
          cash: draft.cash + 450,
          mentalHealth: clamp(draft.mentalHealth - 2, 0, 100),
        },
        intended: ['Picked up a side gig for +$450.'],
        unintended: ['The extra workload reduced mental health by 2.'],
      }),
    },
    {
      id: 'debt-paydown',
      label: 'Pay down debt',
      summary: 'Reduce debt faster if you have enough cash on hand.',
      detail: 'Costs $400 now and removes $550 debt.',
      isAvailable: player.debt > 0 && player.cash >= 400,
      unavailableReason:
        player.debt <= 0 ? 'No debt to pay down.' : 'You need at least $400 cash to make an extra payment.',
      execute: (draft) => ({
        player: {
          ...draft,
          cash: draft.cash - 400,
          debt: Math.max(0, draft.debt - 550),
          mentalHealth: clamp(draft.mentalHealth + 1, 0, 100),
        },
        intended: ['Made an extra debt payment and cut balances by $550.'],
        unintended: [],
      }),
    },
    {
      id: 'join-gym',
      label: 'Join the gym',
      summary: 'Pay an upfront cost now and small monthly dues later for steadier health.',
      detail: 'Costs $120 now, adds $45/month dues, +4 physical health, +1 mental health.',
      isAvailable: player.cash >= 120 && !player.statusEffects.some((effect) => effect.id === 'gym-membership'),
      unavailableReason: player.cash < 120 ? 'You need at least $120 cash.' : 'You already have a gym membership.',
      execute: (draft) => ({
        player: {
          ...draft,
          cash: draft.cash - 120,
          physicalHealth: clamp(draft.physicalHealth + 4, 0, 100),
          mentalHealth: clamp(draft.mentalHealth + 1, 0, 100),
          statusEffects: [...draft.statusEffects, { id: 'gym-membership', label: 'Gym membership', monthlyCost: 45 }],
        },
        intended: ['Joined a gym membership for a healthier routine.'],
        unintended: ['You now pay $45 in gym dues each month.'],
      }),
    },
    {
      id: 'spend-time-with-family-friends',
      label: 'Spend time with family & friends',
      summary: 'Trade a little money for better wellbeing.',
      detail: 'Costs $70, +5 mental health, +1 physical health.',
      isAvailable: player.cash >= 70,
      unavailableReason: 'You need at least $70 cash.',
      execute: (draft) => ({
        player: {
          ...draft,
          cash: draft.cash - 70,
          mentalHealth: clamp(draft.mentalHealth + 5, 0, 100),
          physicalHealth: clamp(draft.physicalHealth + 1, 0, 100),
        },
        intended: ['Spent time with people who matter to you.'],
        unintended: [],
      }),
    },
    {
      id: 'invest-in-stocks',
      label: 'Invest in stocks',
      summary: 'Move cash into a higher-variance asset for future turns.',
      detail: 'Moves $250 cash into stocks.',
      isAvailable: player.cash >= 250,
      unavailableReason: 'You need at least $250 cash.',
      execute: (draft) => ({
        player: {
          ...draft,
          cash: draft.cash - 250,
          stocks: draft.stocks + 250,
          mentalHealth: clamp(draft.mentalHealth + 1, 0, 100),
        },
        intended: ['Invested $250 into stocks.'],
        unintended: [],
      }),
    },
    {
      id: 'relocate-city',
      label: 'Relocate city',
      summary: pendingLabel
        ? `A move to ${pendingLabel} is already queued for next turn.`
        : `Move to a different city next month. Current city: ${currentCity.label}.`,
      detail: 'Costs $700 now and applies the new city next turn.',
      isAvailable: player.cash >= 700 && !player.pendingCityId,
      unavailableReason: player.pendingCityId
        ? 'You already have a relocation queued.'
        : 'You need at least $700 cash to cover moving costs.',
      requiresTarget: true,
      targetOptions: ['metro', 'suburbia', 'small-town']
        .filter((cityId) => cityId !== player.cityId)
        .map((cityId) => ({
          value: cityId,
          label: getCityRule(cityId).label,
        })),
      execute: (draft, input = {}) => {
        const targetCityId = input.targetCityId || draft.cityId
        return {
          player: {
            ...draft,
            cash: draft.cash - 700,
            mentalHealth: clamp(draft.mentalHealth - 2, 0, 100),
            pendingCityId: targetCityId,
          },
          intended: [`Planned a move to ${getCityRule(targetCityId).label} for next turn.`],
          unintended: ['Moving costs and uncertainty reduced mental health by 2.'],
        }
      },
    },
  ]
}

export const getActionCatalog = (game) => {
  const initialized = initializeGameState(game)
  const player = initialized?.players?.[initialized.activePlayerIndex]
  return player ? buildActionDefinitions(initialized, player) : []
}

const createUnavailableActionOutcome = (action, reason, player) => ({
  player,
  intended: [],
  unintended: [reason || `${action.label} could not be completed this month.`],
  explanation: reason || `${action.label} was no longer available when the action phase resolved.`,
})

const chooseEvent = (game, player) => {
  const city = getCityRule(player.cityId)
  const stressLevel = player.cash < 0 || player.debt > player.monthlyIncome * 6 ? 1 : 0
  const lowPhysical = player.physicalHealth < 45 ? 1 : 0
  const lowMental = player.mentalHealth < 45 ? 1 : 0

  const events = [
    {
      id: 'steady-month',
      label: 'Steady month',
      weight: 36 - stressLevel * 4,
      apply: (draft) => ({
        player: draft,
        intended: ['Nothing dramatic happened this month.'],
        unintended: [],
        explanation: 'Base calm-month chance stayed high because no major risk spikes were active.',
      }),
    },
    {
      id: 'work-bonus',
      label: 'Work bonus',
      weight: 18 + Math.round(city.opportunityBonus * 100) + (player.mentalHealth > 60 ? 4 : 0),
      apply: (draft) => ({
        player: {
          ...draft,
          cash: draft.cash + 320,
          mentalHealth: clamp(draft.mentalHealth + 2, 0, 100),
        },
        intended: ['A work opportunity added a $320 bonus.'],
        unintended: [],
        explanation: 'Opportunity-heavy cities and steadier mental health raise the odds of a work upside event.',
      }),
    },
    {
      id: 'surprise-expense',
      label: 'Surprise expense',
      weight: 16 + stressLevel * 6 + (city.id === 'metro' ? 3 : 0),
      apply: (draft) => ({
        player: {
          ...draft,
          cash: draft.cash - 260,
          mentalHealth: clamp(draft.mentalHealth - 1, 0, 100),
        },
        intended: [],
        unintended: ['An unexpected expense cost $260.'],
        explanation: 'Financial stress and higher-cost cities make surprise expenses more likely.',
      }),
    },
    {
      id: 'minor-illness',
      label: 'Minor illness',
      weight: 14 + lowPhysical * 10 + stressLevel * 4,
      apply: (draft) => ({
        player: {
          ...draft,
          physicalHealth: clamp(draft.physicalHealth - 6, 0, 100),
          mentalHealth: clamp(draft.mentalHealth - 2, 0, 100),
        },
        intended: [],
        unintended: ['A minor illness reduced physical health by 6.'],
        explanation: 'Low physical health and financial stress raise the chance of health setbacks.',
      }),
    },
    {
      id: 'social-boost',
      label: 'Social boost',
      weight: 16 + (city.id === 'small-town' ? 4 : 0) + lowMental * 6,
      apply: (draft) => ({
        player: {
          ...draft,
          mentalHealth: clamp(draft.mentalHealth + 5, 0, 100),
        },
        intended: ['A supportive moment improved mental health by 5.'],
        unintended: [],
        explanation: 'Stronger community context and low-mental-health recovery windows raise the chance of support.',
      }),
    },
  ]

  const totalWeight = events.reduce((sum, event) => sum + Math.max(1, event.weight), 0)
  const { nextState, value } = nextRandom(game.randomState)
  let cursor = value * totalWeight
  let selected = events[0]

  for (const event of events) {
    cursor -= Math.max(1, event.weight)
    if (cursor <= 0) {
      selected = event
      break
    }
  }

  return {
    event: selected,
    nextRandomState: nextState,
    oddsSummary: events.map((candidate) => ({
      id: candidate.id,
      label: candidate.label,
      weight: Math.max(1, candidate.weight),
    })),
  }
}

const formatCurrency = (value) => {
  const absolute = Math.abs(roundCurrency(value))
  return `${value < 0 ? '-' : '+'}$${absolute.toLocaleString()}`
}

const formatPointChange = (value) => {
  const absolute = Math.abs(roundCurrency(value))
  return `${value > 0 ? '+' : value < 0 ? '-' : ''}${absolute}`
}

const createDelta = (label, before, after, format = 'currency') => {
  const change = roundCurrency(after - before)
  return {
    label,
    before: roundCurrency(before),
    after: roundCurrency(after),
    change,
    changeLabel: change === 0 ? (format === 'currency' ? '$0' : '0') : format === 'currency' ? formatCurrency(change) : formatPointChange(change),
  }
}

export const resolveTurn = (game, actionSelection = { actionId: 'skip-action' }) => {
  const initialized = initializeGameState(game)
  const activePlayer = initialized.players[initialized.activePlayerIndex]
  const preTurnSnapshot = summarizePlayer(activePlayer)
  let player = { ...activePlayer, statusEffects: [...activePlayer.statusEffects], actionHistory: [...activePlayer.actionHistory] }
  const phases = []
  const explanations = []

  if (player.pendingCityId) {
    const previousCity = getCityRule(player.cityId)
    const nextCity = getCityRule(player.pendingCityId)
    player.cityId = player.pendingCityId
    player.pendingCityId = null
    player.monthlyExpenses = buildPlayerExpenses(player)
    explanations.push(`Relocation to ${nextCity.label} activated this month, replacing ${previousCity.label}.`)
  }

  const financeBefore = summarizePlayer(player)
  const incomeGain = player.monthlyIncome
  const expenseCost = buildPlayerExpenses(player)
  const stockChange = roundCurrency(player.stocks * STOCK_RETURN_RATE)
  const bondChange = roundCurrency(player.bonds * BOND_RETURN_RATE)
  player.cash += incomeGain - expenseCost
  player.stocks += stockChange
  player.bonds += bondChange
  player.monthlyExpenses = expenseCost
  player.netWorth = calculateNetWorth(player)
  phases.push({
    id: 'net-worth',
    title: 'Net worth changes',
    deltas: [
      createDelta('Cash', financeBefore.cash, player.cash),
      createDelta('Stocks', financeBefore.stocks, player.stocks),
      createDelta('Bonds', financeBefore.bonds, player.bonds),
    ],
    explanation: `Income added $${incomeGain.toLocaleString()} while recurring costs removed $${expenseCost.toLocaleString()}.`,
  })

  const debtBefore = summarizePlayer(player)
  let debtExplanation = 'No debt was outstanding this month.'
  if (player.debt > 0) {
    const interest = roundCurrency(player.debt * DEBT_INTEREST_RATE)
    const minimumPayment = Math.min(player.debt + interest, Math.max(MIN_DEBT_PAYMENT, roundCurrency(player.debt * 0.025)))
    player.debt += interest
    const payment = Math.max(0, Math.min(player.cash, minimumPayment))
    player.cash -= payment
    player.debt = Math.max(0, player.debt - payment)
    if (payment < minimumPayment) {
      player.mentalHealth = clamp(player.mentalHealth - 4, 0, 100)
      debtExplanation = `Debt accrued $${interest.toLocaleString()} interest. You only paid $${payment.toLocaleString()} of the $${minimumPayment.toLocaleString()} minimum, which added stress.`
    } else {
      debtExplanation = `Debt accrued $${interest.toLocaleString()} interest and the $${minimumPayment.toLocaleString()} minimum was paid in full.`
    }
  }
  player.netWorth = calculateNetWorth(player)
  phases.push({
    id: 'debt',
    title: 'Debt updates',
    deltas: [
      createDelta('Cash', debtBefore.cash, player.cash),
      createDelta('Debt', debtBefore.debt, player.debt),
    ],
    explanation: debtExplanation,
  })

  const healthBefore = summarizePlayer(player)
  const city = getCityRule(player.cityId)
  const career = getCareerRule(player.jobId)
  const stressPenalty = player.cash < 0 || player.debt > player.monthlyIncome * 6 ? 4 : player.debt > player.monthlyIncome * 3 ? 2 : 0
  const gymBonus = player.statusEffects.some((effect) => effect.id === 'gym-membership') ? 1 : 0
  player.physicalHealth = clamp(player.physicalHealth + city.physicalBaseline + career.physicalBias + gymBonus, 0, 100)
  player.mentalHealth = clamp(player.mentalHealth + city.mentalBaseline + career.mentalBias - stressPenalty, 0, 100)
  phases.push({
    id: 'health',
    title: 'Health updates',
    deltas: [
      createDelta('Physical health', healthBefore.physicalHealth, player.physicalHealth, 'points'),
      createDelta('Mental health', healthBefore.mentalHealth, player.mentalHealth, 'points'),
    ],
    explanation: stressPenalty
      ? 'City and career baselines applied, but financial stress reduced mental health this month.'
      : 'City and career baselines nudged health values without a stress penalty.',
  })

  const eventBefore = summarizePlayer(player)
  const { event, nextRandomState, oddsSummary } = chooseEvent(initialized, player)
  initialized.randomState = nextRandomState
  const eventOutcome = event.apply(player)
  player = {
    ...eventOutcome.player,
    statusEffects: [...eventOutcome.player.statusEffects],
    actionHistory: [...eventOutcome.player.actionHistory],
  }
  phases.push({
    id: 'event',
    title: 'Event resolution',
    deltas: [
      createDelta('Cash', eventBefore.cash, player.cash),
      createDelta('Physical health', eventBefore.physicalHealth, player.physicalHealth, 'points'),
      createDelta('Mental health', eventBefore.mentalHealth, player.mentalHealth, 'points'),
    ],
    explanation: eventOutcome.explanation,
  })

  const actionBefore = summarizePlayer(player)
  const actionCatalog = buildActionDefinitions(initialized, player)
  const requestedAction =
    actionCatalog.find((candidate) => candidate.id === actionSelection.actionId) ||
    actionCatalog.find((candidate) => candidate.id === 'skip-action')
  const hasValidTarget =
    !requestedAction?.requiresTarget ||
    requestedAction.targetOptions.some((option) => option.value === actionSelection.targetCityId)
  const action =
    requestedAction && requestedAction.isAvailable && hasValidTarget
      ? requestedAction
      : actionCatalog.find((candidate) => candidate.id === 'skip-action')
  const actionOutcome =
    requestedAction && action !== requestedAction
      ? createUnavailableActionOutcome(
          requestedAction,
          !requestedAction.isAvailable
            ? requestedAction.unavailableReason
            : requestedAction.requiresTarget
              ? 'Choose a valid destination city before relocating.'
              : undefined,
          player,
        )
      : action.execute(player, actionSelection)
  player = {
    ...actionOutcome.player,
    statusEffects: [...actionOutcome.player.statusEffects],
    actionHistory: [
      ...actionOutcome.player.actionHistory,
      {
        turnNumber: initialized.turnNumber,
        actionId: action.id,
        label: action.label,
      },
    ],
  }
  player.monthlyExpenses = buildPlayerExpenses(player)
  player.netWorth = calculateNetWorth(player)
  phases.push({
    id: 'action',
    title: 'Player action',
    deltas: [
      createDelta('Cash', actionBefore.cash, player.cash),
      createDelta('Debt', actionBefore.debt, player.debt),
      createDelta('Stocks', actionBefore.stocks, player.stocks),
      createDelta('Physical health', actionBefore.physicalHealth, player.physicalHealth, 'points'),
      createDelta('Mental health', actionBefore.mentalHealth, player.mentalHealth, 'points'),
    ],
    explanation: actionOutcome.explanation || action.detail,
  })

  const summaryBefore = summarizePlayer(activePlayer)
  const postTurnSnapshot = summarizePlayer(player)
  phases.push({
    id: 'summary',
    title: 'End-of-turn summary',
    deltas: [
      createDelta('Net worth', summaryBefore.netWorth, postTurnSnapshot.netWorth),
      createDelta('Cash', summaryBefore.cash, postTurnSnapshot.cash),
      createDelta('Debt', summaryBefore.debt, postTurnSnapshot.debt),
    ],
    explanation: 'Monthly changes have been applied and the seat rotates to the next player.',
  })

  const nextPlayers = initialized.players.map((candidate, index) =>
    index === initialized.activePlayerIndex ? player : candidate,
  )

  const nextActivePlayerIndex = nextPlayers.length === 0 ? 0 : (initialized.activePlayerIndex + 1) % nextPlayers.length
  const turnResolution = {
    playerId: activePlayer.id,
    playerName: activePlayer.name,
    turnNumber: initialized.turnNumber,
    preTurn: preTurnSnapshot,
    phases,
    explanations,
    event: {
      id: event.id,
      label: event.label,
      intended: eventOutcome.intended,
      unintended: eventOutcome.unintended,
      odds: oddsSummary,
      explanation: eventOutcome.explanation,
    },
    action: {
      id: action.id,
      label: requestedAction?.label || action.label,
      intended: actionOutcome.intended,
      unintended: actionOutcome.unintended,
      targetCityId: hasValidTarget ? actionSelection.targetCityId || null : null,
    },
    postTurn: postTurnSnapshot,
  }

  const updatedGame = {
    ...initialized,
    players: nextPlayers,
    activePlayerIndex: nextActivePlayerIndex,
    turnNumber: initialized.turnNumber + 1,
    lastTurnAt: Date.now(),
    lastUpdated: Date.now(),
    phase: 'pass-control',
    randomState: initialized.randomState,
    turnHistory: [...initialized.turnHistory, turnResolution],
  }

  return {
    updatedGame,
    turnResolution,
  }
}

export const getCurrentPlayer = (game) => {
  const initialized = initializeGameState(game)
  return initialized?.players?.[initialized.activePlayerIndex] || null
}

export const getUpcomingPlayer = (game) => {
  const initialized = initializeGameState(game)
  if (!initialized?.players?.length) {
    return null
  }
  return initialized.players[initialized.activePlayerIndex]
}

export const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)
