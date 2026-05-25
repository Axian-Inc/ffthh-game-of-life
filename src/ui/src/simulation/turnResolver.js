import {
  getCareerRule,
  getCityRule,
  getPlayerProfileRule,
  resolveWorldSettingsEffects,
} from './definitions'
import { randomIntInclusive, createSeededRng } from './random'
import { computeNetWorth, normalizePlayerState } from './playerState'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const ACTION_BASE_EFFECTS = {
  pass: {
    cash: 0,
    debt: 0,
    assetsValue: 0,
    physicalHealth: -1,
    mentalHealth: -1,
    stress: 2,
  },
  choose_action: {
    cash: -100,
    debt: 0,
    assetsValue: 60,
    physicalHealth: 1,
    mentalHealth: 1,
    stress: -1,
  },
  study: {
    cash: -280,
    debt: 85,
    assetsValue: 20,
    physicalHealth: -1,
    mentalHealth: 1,
    stress: 1,
  },
  workout: {
    cash: -90,
    debt: 0,
    assetsValue: 0,
    physicalHealth: 3,
    mentalHealth: 1,
    stress: -2,
  },
  side_gig: {
    cash: 260,
    debt: 0,
    assetsValue: 20,
    physicalHealth: -1,
    mentalHealth: -1,
    stress: 2,
  },
  debt_paydown: {
    cash: -220,
    debt: -280,
    assetsValue: 0,
    physicalHealth: 0,
    mentalHealth: 1,
    stress: -1,
  },
  social_time: {
    cash: -120,
    debt: 0,
    assetsValue: 0,
    physicalHealth: 0,
    mentalHealth: 3,
    stress: -2,
  },
  vacation_escape: {
    cash: -900,
    debt: 0,
    assetsValue: 0,
    physicalHealth: 1,
    mentalHealth: 5,
    stress: -4,
  },
  startup_bet: {
    cash: -700,
    debt: 0,
    assetsValue: 500,
    physicalHealth: 0,
    mentalHealth: 0,
    stress: 2,
  },
  festival_weekend: {
    cash: -350,
    debt: 0,
    assetsValue: 0,
    physicalHealth: 0,
    mentalHealth: 4,
    stress: -3,
  },
}

const ISSUE_CATALOG = [
  { id: 'car_breakdown', label: 'Car Breakdown', spawnChance: 0.07, ignore: { cash: -120, stress: 1 }, address: { cash: -450, stress: 1 } },
  {
    id: 'plumbing_leak',
    label: 'Plumbing Leak',
    spawnChance: 0.06,
    ignore: { cash: -90, mentalHealth: -1 },
    address: { cash: -380, stress: 1 },
  },
  {
    id: 'burnout_warning',
    label: 'Burnout Warning',
    spawnChance: 0.05,
    ignore: { mentalHealth: -2, stress: 2, physicalHealth: -1 },
    address: { cash: -140, mentalHealth: 2, stress: -2 },
  },
]

const applyDelta = (state, delta) => ({
  ...state,
  cash: Math.round(state.cash + (delta.cash || 0)),
  debt: clamp(Math.round(state.debt + (delta.debt || 0)), 0, Number.MAX_SAFE_INTEGER),
  assetsValue: clamp(Math.round(state.assetsValue + (delta.assetsValue || 0)), 0, Number.MAX_SAFE_INTEGER),
  physicalHealth: clamp(Math.round(state.physicalHealth + (delta.physicalHealth || 0)), 0, 100),
  mentalHealth: clamp(Math.round(state.mentalHealth + (delta.mentalHealth || 0)), 0, 100),
  stress: clamp(Math.round(state.stress + (delta.stress || 0)), 0, 100),
})

const getActionBaseEffects = (actionType) => ({ ...(ACTION_BASE_EFFECTS[actionType] || ACTION_BASE_EFFECTS.pass) })

const parseIssueActionType = (actionType) => {
  if (!String(actionType).startsWith('address_issue:')) {
    return null
  }
  return String(actionType).slice('address_issue:'.length)
}

const scaleIssuePenalty = (delta, stackCount) => {
  const multiplier = Math.pow(1.2, Math.max(0, stackCount))
  return {
    cash: Math.max(-450, Math.round((delta.cash || 0) * multiplier)),
    debt: Math.round((delta.debt || 0) * multiplier),
    assetsValue: Math.round((delta.assetsValue || 0) * multiplier),
    physicalHealth: Math.max(-4, Math.round((delta.physicalHealth || 0) * multiplier)),
    mentalHealth: Math.max(-4, Math.round((delta.mentalHealth || 0) * multiplier)),
    stress: Math.min(5, Math.round((delta.stress || 0) * multiplier)),
  }
}

const getRandomDelta = (rng, volatilityMultiplier) => ({
  cash: randomIntInclusive(rng, -120, 120) * volatilityMultiplier,
  debt: randomIntInclusive(rng, -35, 55) * volatilityMultiplier,
  assetsValue: randomIntInclusive(rng, -90, 130) * volatilityMultiplier,
  physicalHealth: randomIntInclusive(rng, -2, 2),
  mentalHealth: randomIntInclusive(rng, -2, 2),
  stress: randomIntInclusive(rng, -2, 2),
})

export const resolvePlayerTurn = ({ game, player, actionType, turnNumber, playerName }) => {
  const normalizedPlayer = normalizePlayerState(player, game?.modifierContext)
  const modifierContext = game?.modifierContext || {}
  const worldEffects = resolveWorldSettingsEffects(modifierContext.worldSettings)
  const cityRule = getCityRule(normalizedPlayer.cityId)
  const careerRule = getCareerRule(normalizedPlayer.jobId)
  const profileRule = getPlayerProfileRule(normalizedPlayer.profileId)
  const rng = createSeededRng(`${game?.seed || game?.id || 'game'}:${turnNumber}:${normalizedPlayer.id}:${actionType}`)

  const preTurn = {
    cash: normalizedPlayer.cash,
    debt: normalizedPlayer.debt,
    assetsValue: normalizedPlayer.assetsValue,
    netWorth: normalizedPlayer.netWorth,
    monthlyIncome: normalizedPlayer.monthlyIncome,
    physicalHealth: normalizedPlayer.physicalHealth,
    mentalHealth: normalizedPlayer.mentalHealth,
    stress: normalizedPlayer.stress,
  }

  const recurringCosts = Math.round(careerRule.recurringCostBase * cityRule.costMultiplier * worldEffects.monthlyExpenseMultiplier)
  const grossIncome = Math.round(normalizedPlayer.monthlyIncome * worldEffects.incomeMultiplier)
  const lowMentalIncomeMultiplier =
    normalizedPlayer.mentalHealth < 40 && profileRule.lowMentalIncomeMultiplierBelow40
      ? profileRule.lowMentalIncomeMultiplierBelow40
      : 1
  const adjustedGrossIncome = Math.round(grossIncome * lowMentalIncomeMultiplier)
  const taxes = Math.round(adjustedGrossIncome * cityRule.taxRate)
  const netIncome = adjustedGrossIncome - taxes

  const debtInterest = Math.round(normalizedPlayer.debt * 0.0125)
  const minimumDebtPayment =
    normalizedPlayer.debt > 0
      ? Math.max(75, Math.round(normalizedPlayer.debt * 0.02 * (profileRule.debtPaymentMultiplier || 1)))
      : 0

  let next = { ...normalizedPlayer, activeIssues: Array.isArray(normalizedPlayer.activeIssues) ? [...normalizedPlayer.activeIssues] : [] }
  const phaseDeltas = []

  const financialBaseDelta = {
    cash: netIncome - recurringCosts - minimumDebtPayment,
    debt: debtInterest - minimumDebtPayment,
    assetsValue: 0,
    physicalHealth: 0,
    mentalHealth: 0,
    stress: 0,
  }
  next = applyDelta(next, financialBaseDelta)
  phaseDeltas.push({ phase: 'financial', delta: financialBaseDelta, explanation: 'Income, taxes, recurring costs, and debt minimum applied.' })

  const healthBaseDelta = {
    cash: 0,
    debt: 0,
    assetsValue: 0,
    physicalHealth: careerRule.physicalDrift + cityRule.physicalDrift,
    mentalHealth: careerRule.mentalDrift + cityRule.mentalDrift,
    stress: careerRule.stressDrift + worldEffects.stressDriftBonus,
  }
  healthBaseDelta.physicalHealth += worldEffects.physicalDriftBonus
  healthBaseDelta.mentalHealth += worldEffects.mentalDriftBonus

  if (next.debt > Math.max(5000, next.monthlyIncome * 2)) {
    healthBaseDelta.mentalHealth -= 1
    healthBaseDelta.stress += 1
  }
  next = applyDelta(next, healthBaseDelta)
  phaseDeltas.push({ phase: 'health', delta: healthBaseDelta, explanation: 'Career, city, and debt-pressure health drift applied.' })

  const addressedIssueId = parseIssueActionType(actionType)
  let effectiveActionType = actionType
  let actionBaseDelta = getActionBaseEffects(actionType)
  if (addressedIssueId) {
    const issue = next.activeIssues.find((entry) => entry.id === addressedIssueId)
    const issueRule = ISSUE_CATALOG.find((entry) => entry.id === issue?.issueType)
    if (issue && issueRule) {
      effectiveActionType = `address_issue:${issueRule.id}`
      actionBaseDelta = {
        cash: issueRule.address.cash || 0,
        debt: issueRule.address.debt || 0,
        assetsValue: issueRule.address.assetsValue || 0,
        physicalHealth: issueRule.address.physicalHealth || 0,
        mentalHealth: issueRule.address.mentalHealth || 0,
        stress: issueRule.address.stress || 0,
      }
      next.activeIssues = next.activeIssues.filter((entry) => entry.id !== addressedIssueId)
    }
  }
  if (actionType === 'choose_action') {
    actionBaseDelta.assetsValue = Math.round(actionBaseDelta.assetsValue * (profileRule.chooseActionAssetBonusMultiplier || 1))
    actionBaseDelta.cash += profileRule.chooseActionCashFlat || 0
    actionBaseDelta.stress += profileRule.chooseActionStressFlat || 0
    actionBaseDelta.mentalHealth += profileRule.chooseActionMentalFlat || 0
  }
  if (actionType === 'pass') {
    actionBaseDelta.stress += profileRule.passStressFlat || 0
  }
  if (actionType === 'vacation_escape') {
    actionBaseDelta.cash += randomIntInclusive(rng, -500, 0)
    actionBaseDelta.mentalHealth += randomIntInclusive(rng, -2, 2)
  }
  if (actionType === 'startup_bet') {
    actionBaseDelta.assetsValue += randomIntInclusive(rng, -800, 1400)
    actionBaseDelta.mentalHealth += randomIntInclusive(rng, -1, 1)
  }
  if (actionType === 'festival_weekend') {
    actionBaseDelta.cash += randomIntInclusive(rng, -250, 0)
    actionBaseDelta.physicalHealth += randomIntInclusive(rng, -1, 1)
  }
  next = applyDelta(next, actionBaseDelta)
  phaseDeltas.push({ phase: 'action_base', delta: actionBaseDelta, explanation: 'Action guaranteed base effects applied.' })

  const issueTickDelta = { cash: 0, debt: 0, assetsValue: 0, physicalHealth: 0, mentalHealth: 0, stress: 0 }
  next.activeIssues = next.activeIssues.map((issue) => {
    if (issue.id === addressedIssueId) {
      return issue
    }
    const issueRule = ISSUE_CATALOG.find((entry) => entry.id === issue.issueType)
    if (!issueRule) {
      return issue
    }
    const tick = scaleIssuePenalty(issueRule.ignore, issue.stackCount || 0)
    issueTickDelta.cash += tick.cash || 0
    issueTickDelta.debt += tick.debt || 0
    issueTickDelta.assetsValue += tick.assetsValue || 0
    issueTickDelta.physicalHealth += tick.physicalHealth || 0
    issueTickDelta.mentalHealth += tick.mentalHealth || 0
    issueTickDelta.stress += tick.stress || 0
    return {
      ...issue,
      stackCount: Math.min(5, (issue.stackCount || 0) + 1),
      turnsActive: (issue.turnsActive || 0) + 1,
    }
  })
  next = applyDelta(next, issueTickDelta)
  if (Object.values(issueTickDelta).some((value) => value !== 0)) {
    phaseDeltas.push({ phase: 'issue_tick', delta: issueTickDelta, explanation: 'Ignored issues applied compounding penalties.' })
  }

  const issueSpawnRng = createSeededRng(`${game?.seed || game?.id || 'game'}:issue:${turnNumber}:${normalizedPlayer.id}`)
  if (next.activeIssues.length < 2) {
    for (const issueRule of ISSUE_CATALOG) {
      if (next.activeIssues.some((issue) => issue.issueType === issueRule.id)) {
        continue
      }
      if (issueSpawnRng() < issueRule.spawnChance) {
        next.activeIssues.push({
          id: `${issueRule.id}-${turnNumber}`,
          issueType: issueRule.id,
          label: issueRule.label,
          stackCount: 0,
          turnsActive: 0,
        })
        break
      }
    }
  }

  const combinedVolatilityMultiplier = worldEffects.randomVolatilityMultiplier * (profileRule.randomVolatilityMultiplier || 1)
  const randomDelta = getRandomDelta(rng, combinedVolatilityMultiplier)
  randomDelta.stress += profileRule.randomStressDeltaFlat || 0
  randomDelta.mentalHealth += profileRule.randomMentalDeltaFlat || 0
  next = applyDelta(next, randomDelta)
  phaseDeltas.push({ phase: 'random', delta: randomDelta, explanation: 'Random bounded variation applied after base effects.' })

  next.netWorth = computeNetWorth({ cash: next.cash, assets: next.assetsValue, debt: next.debt })

  const totalDelta = {
    cash: next.cash - preTurn.cash,
    debt: next.debt - preTurn.debt,
    assetsValue: next.assetsValue - preTurn.assetsValue,
    netWorth: next.netWorth - preTurn.netWorth,
    physicalHealth: next.physicalHealth - preTurn.physicalHealth,
    mentalHealth: next.mentalHealth - preTurn.mentalHealth,
    stress: next.stress - preTurn.stress,
  }

  const turnLog = {
    id: `turn-${normalizedPlayer.id}-${turnNumber}-${Date.now()}`,
    playerId: normalizedPlayer.id,
    playerName,
    turnNumber,
    actionType: effectiveActionType,
    preTurn,
    postTurn: {
      cash: next.cash,
      debt: next.debt,
      assetsValue: next.assetsValue,
      netWorth: next.netWorth,
      monthlyIncome: next.monthlyIncome,
      physicalHealth: next.physicalHealth,
      mentalHealth: next.mentalHealth,
      stress: next.stress,
      activeIssues: next.activeIssues,
    },
    phaseDeltas,
    totalDelta,
    createdAt: Date.now(),
  }

  const actionHistoryEntry = {
    id: `action-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    actionType: effectiveActionType,
    turnNumber,
    totalDelta,
    createdAt: Date.now(),
  }

  return {
    player: {
      ...next,
      actionHistory: [...(Array.isArray(next.actionHistory) ? next.actionHistory : []), actionHistoryEntry],
    },
    turnLog,
    totalDelta,
  }
}
