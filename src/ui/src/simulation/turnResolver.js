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
}

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

const getRandomDelta = (rng, volatilityMultiplier) => ({
  cash: randomIntInclusive(rng, -120, 120) * volatilityMultiplier,
  debt: randomIntInclusive(rng, -35, 55) * volatilityMultiplier,
  assetsValue: randomIntInclusive(rng, -90, 130) * volatilityMultiplier,
  physicalHealth: randomIntInclusive(rng, -2, 2),
  mentalHealth: randomIntInclusive(rng, -2, 2),
  stress: randomIntInclusive(rng, -2, 2),
})

export const resolvePlayerTurn = ({ game, player, actionType, turnNumber, playerName }) => {
  const normalizedPlayer = normalizePlayerState(player)
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

  let next = { ...normalizedPlayer }
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

  const actionBaseDelta = getActionBaseEffects(actionType)
  if (actionType === 'choose_action') {
    actionBaseDelta.assetsValue = Math.round(actionBaseDelta.assetsValue * (profileRule.chooseActionAssetBonusMultiplier || 1))
    actionBaseDelta.cash += profileRule.chooseActionCashFlat || 0
    actionBaseDelta.stress += profileRule.chooseActionStressFlat || 0
    actionBaseDelta.mentalHealth += profileRule.chooseActionMentalFlat || 0
  }
  if (actionType === 'pass') {
    actionBaseDelta.stress += profileRule.passStressFlat || 0
  }
  next = applyDelta(next, actionBaseDelta)
  phaseDeltas.push({ phase: 'action_base', delta: actionBaseDelta, explanation: 'Action guaranteed base effects applied.' })

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
    actionType,
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
    },
    phaseDeltas,
    totalDelta,
    createdAt: Date.now(),
  }

  const actionHistoryEntry = {
    id: `action-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    actionType,
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
