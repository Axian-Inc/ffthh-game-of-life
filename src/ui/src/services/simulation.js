import {
  BASE_MONTHLY_LIVING_COST,
  CAREER_DEFINITION_BY_ID,
  CITY_DEFINITION_BY_ID,
  DEFAULT_CAREER_ID,
  DEFAULT_CITY_ID,
  MONTHS_PER_YEAR,
  WEEKS_PER_MONTH,
} from '../data/simulationDefinitions'

const DEFAULT_START_AGE = 18
const DEFAULT_HEALTH = 72
const DEBT_MINIMUM_PAYMENT_RATE = 0.02
const DEBT_ANNUAL_INTEREST_RATE = 0.06

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const toMoney = (value) => Math.round(Number.isFinite(value) ? value : 0)
const toHealth = (value) => clamp(Math.round(Number.isFinite(value) ? value : DEFAULT_HEALTH), 0, 100)

const generateId = (prefix) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

export const getCareerDefinition = (careerId) =>
  CAREER_DEFINITION_BY_ID[careerId] || CAREER_DEFINITION_BY_ID[DEFAULT_CAREER_ID]

export const getCityDefinition = (cityId) => CITY_DEFINITION_BY_ID[cityId] || CITY_DEFINITION_BY_ID[DEFAULT_CITY_ID]

export const sumAssetValue = (assets = []) =>
  Array.isArray(assets) ? assets.reduce((total, asset) => total + toMoney(asset?.value), 0) : 0

export const sumDebtBalance = (debts = []) =>
  Array.isArray(debts) ? debts.reduce((total, debt) => total + toMoney(debt?.balance), 0) : 0

export const calculateNetWorth = ({ cash = 0, assets = [], debts = [] }) =>
  toMoney(cash) + sumAssetValue(assets) - sumDebtBalance(debts)

const buildStartingDebt = (career) => {
  if (!career.startDebt) {
    return []
  }

  return [
    {
      id: `${career.id}-starter-debt`,
      label: career.trackId === 'degree' ? 'Student loan' : 'Starter debt',
      balance: career.startDebt,
      annualInterestRate: DEBT_ANNUAL_INTEREST_RATE,
      minimumPaymentRate: DEBT_MINIMUM_PAYMENT_RATE,
    },
  ]
}

export const initializePlayerState = (player, index = 0) => {
  const careerId = player?.careerId || player?.jobId || DEFAULT_CAREER_ID
  const cityId = player?.cityId || DEFAULT_CITY_ID
  const career = getCareerDefinition(careerId)
  const city = getCityDefinition(cityId)
  const debts = Array.isArray(player?.debts) ? player.debts : buildStartingDebt(career)
  const assets = Array.isArray(player?.assets) ? player.assets : []
  const physicalHealth = toHealth(
    player?.physicalHealth ?? DEFAULT_HEALTH + (career.riskModifiers?.physicalHealth || 0) + city.physicalBaseline,
  )
  const mentalHealth = toHealth(
    player?.mentalHealth ?? DEFAULT_HEALTH + (career.riskModifiers?.mentalHealth || 0) + city.mentalBaseline,
  )
  const cash = toMoney(player?.cash ?? career.startCash)

  return {
    ...player,
    id: player?.id != null ? String(player.id) : `player-${index + 1}`,
    name: typeof player?.name === 'string' && player.name.trim() ? player.name.trim() : `Player ${index + 1}`,
    avatar: player?.avatar || '',
    age: Number.isFinite(player?.age) ? player.age : DEFAULT_START_AGE,
    cityId: city.id,
    careerId: career.id,
    jobId: player?.jobId || career.id,
    educationTrackId: player?.educationTrackId || career.trackId,
    careerTrack: player?.careerTrack || career.label,
    cash,
    debts,
    assets,
    netWorth: calculateNetWorth({ cash, assets, debts }),
    physicalHealth,
    mentalHealth,
    statusEffects: Array.isArray(player?.statusEffects) ? player.statusEffects : [],
    actionHistory: Array.isArray(player?.actionHistory) ? player.actionHistory : [],
  }
}

export const initializePlayers = (players = []) =>
  Array.isArray(players) ? players.map((player, index) => initializePlayerState(player, index)) : []

const snapshotPlayer = (player) => ({
  cash: toMoney(player.cash),
  debts: Array.isArray(player.debts) ? player.debts.map((debt) => ({ ...debt })) : [],
  assets: Array.isArray(player.assets) ? player.assets.map((asset) => ({ ...asset })) : [],
  netWorth: calculateNetWorth(player),
  physicalHealth: toHealth(player.physicalHealth),
  mentalHealth: toHealth(player.mentalHealth),
  statusEffects: Array.isArray(player.statusEffects) ? player.statusEffects.map((effect) => ({ ...effect })) : [],
})

const buildDelta = (before, after) => ({
  cash: toMoney(after.cash) - toMoney(before.cash),
  debt: sumDebtBalance(after.debts) - sumDebtBalance(before.debts),
  netWorth: calculateNetWorth(after) - calculateNetWorth(before),
  physicalHealth: toHealth(after.physicalHealth) - toHealth(before.physicalHealth),
  mentalHealth: toHealth(after.mentalHealth) - toHealth(before.mentalHealth),
})

export const resolveNoActionTurn = ({ player, turnNumber, actionType = 'pass', actionLabel = 'Pass', createdAt = Date.now() }) => {
  const initializedPlayer = initializePlayerState(player)
  const career = getCareerDefinition(initializedPlayer.careerId)
  const city = getCityDefinition(initializedPlayer.cityId)
  const preTurnSnapshot = snapshotPlayer(initializedPlayer)
  const nextPlayer = {
    ...initializedPlayer,
    cash: toMoney(initializedPlayer.cash),
    debts: initializedPlayer.debts.map((debt) => ({ ...debt })),
    assets: initializedPlayer.assets.map((asset) => ({ ...asset })),
    statusEffects: initializedPlayer.statusEffects.map((effect) => ({ ...effect })),
  }
  const phases = []

  const grossIncome = toMoney(career.weeklyIncome * WEEKS_PER_MONTH * city.opportunityMultiplier)
  const taxes = toMoney(grossIncome * city.taxRate)
  const recurringCosts = toMoney(BASE_MONTHLY_LIVING_COST * city.costOfLivingMultiplier)
  nextPlayer.cash += grossIncome - taxes - recurringCosts
  phases.push({
    id: 'net-worth',
    label: 'Net Worth Changes',
    delta: { cash: grossIncome - taxes - recurringCosts },
    explanations: [
      `${career.label} income added $${grossIncome.toLocaleString()} before taxes.`,
      `${city.label} taxes and living costs removed $${(taxes + recurringCosts).toLocaleString()}.`,
    ],
  })

  let interestTotal = 0
  let paymentTotal = 0
  let missedMinimumTotal = 0
  nextPlayer.debts = nextPlayer.debts.map((debt) => {
    const annualInterestRate = Number.isFinite(debt.annualInterestRate) ? debt.annualInterestRate : DEBT_ANNUAL_INTEREST_RATE
    const minimumPaymentRate = Number.isFinite(debt.minimumPaymentRate)
      ? debt.minimumPaymentRate
      : DEBT_MINIMUM_PAYMENT_RATE
    const interest = toMoney(debt.balance * (annualInterestRate / MONTHS_PER_YEAR))
    const balanceWithInterest = toMoney(debt.balance + interest)
    const minimumPayment = toMoney(Math.max(25, balanceWithInterest * minimumPaymentRate))
    const payment = toMoney(Math.min(Math.max(nextPlayer.cash, 0), minimumPayment, balanceWithInterest))
    const missedMinimum = Math.max(0, minimumPayment - payment)
    const penalty = missedMinimum > 0 ? toMoney(missedMinimum * 0.05) : 0

    nextPlayer.cash -= payment
    interestTotal += interest
    paymentTotal += payment
    missedMinimumTotal += missedMinimum

    return {
      ...debt,
      balance: toMoney(balanceWithInterest - payment + penalty),
    }
  })
  phases.push({
    id: 'debt-updates',
    label: 'Debt Updates',
    delta: { cash: -paymentTotal, debt: interestTotal - paymentTotal + toMoney(missedMinimumTotal * 0.05) },
    explanations: nextPlayer.debts.length
      ? [
          `Debt accrued $${interestTotal.toLocaleString()} in interest.`,
          `Minimum payments used $${paymentTotal.toLocaleString()} cash.`,
          missedMinimumTotal > 0
            ? `Missed minimum payments added pressure of $${missedMinimumTotal.toLocaleString()}.`
            : 'All debt minimums were covered this month.',
        ]
      : ['No outstanding debts this month.'],
  })

  const debtToMonthlyIncome = grossIncome > 0 ? sumDebtBalance(nextPlayer.debts) / grossIncome : 0
  const cashStress = nextPlayer.cash < recurringCosts ? -2 : 0
  const debtStress = debtToMonthlyIncome > 4 ? -2 : debtToMonthlyIncome > 2 ? -1 : 0
  const missedPaymentStress = missedMinimumTotal > 0 ? -3 : 0
  const mentalDelta = city.mentalBaseline + cashStress + debtStress + missedPaymentStress
  const physicalDelta = city.physicalBaseline
  nextPlayer.mentalHealth = toHealth(nextPlayer.mentalHealth + mentalDelta)
  nextPlayer.physicalHealth = toHealth(nextPlayer.physicalHealth + physicalDelta)
  phases.push({
    id: 'health',
    label: 'Physical and Mental Health',
    delta: { mentalHealth: mentalDelta, physicalHealth: physicalDelta },
    explanations: [
      `${city.label} changed physical health by ${physicalDelta}.`,
      `Financial pressure changed mental health by ${mentalDelta}.`,
    ],
  })

  phases.push({
    id: 'event',
    label: 'Event Resolution',
    delta: {},
    explanations: ['No random life event is active in this foundation slice.'],
  })
  phases.push({
    id: 'action',
    label: 'Player Action',
    delta: {},
    explanations: ['Pass used no optional action this month.'],
  })

  nextPlayer.netWorth = calculateNetWorth(nextPlayer)
  const postTurnSnapshot = snapshotPlayer(nextPlayer)
  const totalDelta = buildDelta(preTurnSnapshot, postTurnSnapshot)
  const summary = `Net worth changed by $${totalDelta.netWorth.toLocaleString()} this month.`
  const actionHistoryEntry = {
    id: generateId('action'),
    turnNumber,
    actionType,
    actionLabel,
    summary,
    createdAt,
  }
  nextPlayer.actionHistory = [...nextPlayer.actionHistory, actionHistoryEntry]

  return {
    player: nextPlayer,
    turnLogEntry: {
      id: generateId('turn'),
      playerId: nextPlayer.id,
      playerName: nextPlayer.name,
      turnNumber,
      actionType,
      actionLabel,
      preTurnSnapshot,
      phases,
      phaseDeltas: phases.map((phase) => ({ id: phase.id, label: phase.label, delta: phase.delta })),
      totalDelta,
      explanations: phases.flatMap((phase) => phase.explanations),
      postTurnSnapshot,
      summary,
      createdAt,
    },
  }
}
