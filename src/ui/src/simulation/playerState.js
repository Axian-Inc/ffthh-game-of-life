import { CAREER_DEFINITION_BY_ID, CITY_DEFINITION_BY_ID } from '../data/simulationDefinitions'

const DEFAULT_CAREER_ID = 'content-creator'
const DEFAULT_CITY_ID = 'suburbia'
const STARTING_AGE = 18
const BASE_HEALTH = 75
const DEFAULT_DEBT_INTEREST_RATE = 0.06

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const toFiniteNumber = (value, fallback = 0) => (Number.isFinite(value) ? value : fallback)

const sumAmounts = (items) => {
  if (!Array.isArray(items)) {
    return 0
  }

  return items.reduce((total, item) => {
    const amount = Number.isFinite(item?.value) ? item.value : item?.balance
    return Number.isFinite(amount) ? total + amount : total
  }, 0)
}

export const calculateNetWorth = ({ cash = 0, assets = [], debts = [] } = {}) =>
  cash + sumAmounts(assets) - sumAmounts(debts)

const getCareerDefinition = (careerId) => CAREER_DEFINITION_BY_ID[careerId] || CAREER_DEFINITION_BY_ID[DEFAULT_CAREER_ID]

const getCityDefinition = (cityId) => CITY_DEFINITION_BY_ID[cityId] || CITY_DEFINITION_BY_ID[DEFAULT_CITY_ID]

const buildStartingDebts = (career) => {
  if (!career.startDebt) {
    return []
  }

  return [
    {
      id: `${career.id}-starting-debt`,
      label: career.trackId === 'degree' ? 'Student debt' : 'Career starting debt',
      type: career.trackId === 'degree' ? 'student-loan' : 'personal-loan',
      balance: career.startDebt,
      annualInterestRate: DEFAULT_DEBT_INTEREST_RATE,
      minimumMonthlyPayment: Math.max(50, Math.round(career.startDebt * 0.01)),
    },
  ]
}

export const initializePlayerState = (player = {}) => {
  const career = getCareerDefinition(player.careerId || player.jobId)
  const city = getCityDefinition(player.cityId)
  const debts = buildStartingDebts(career)
  const assets = []
  const cash = career.startCash
  const mentalStressModifier = Number.isFinite(career.riskModifiers?.mentalStress)
    ? career.riskModifiers.mentalStress
    : 0

  return {
    ...player,
    name: typeof player.name === 'string' ? player.name.trim() : '',
    cityId: city.id,
    jobId: career.id,
    age: STARTING_AGE,
    careerId: career.id,
    cash,
    debts,
    assets,
    netWorth: calculateNetWorth({ cash, assets, debts }),
    physicalHealth: clamp(BASE_HEALTH + city.physicalBaseline, 0, 100),
    mentalHealth: clamp(BASE_HEALTH + city.mentalBaseline - mentalStressModifier, 0, 100),
    statusEffects: [],
    actionHistory: [],
  }
}

const normalizeDebt = (debt, index) => {
  const balance = toFiniteNumber(debt?.balance, toFiniteNumber(debt?.value, 0))

  return {
    ...debt,
    id: debt?.id != null ? String(debt.id) : `debt-${index + 1}`,
    label: typeof debt?.label === 'string' && debt.label.trim() ? debt.label : 'Debt',
    type: typeof debt?.type === 'string' && debt.type.trim() ? debt.type : 'debt',
    balance,
    annualInterestRate: toFiniteNumber(debt?.annualInterestRate, DEFAULT_DEBT_INTEREST_RATE),
    minimumMonthlyPayment: Math.max(0, toFiniteNumber(debt?.minimumMonthlyPayment, Math.round(balance * 0.01))),
  }
}

const normalizeAsset = (asset, index) => ({
  ...asset,
  id: asset?.id != null ? String(asset.id) : `asset-${index + 1}`,
  label: typeof asset?.label === 'string' && asset.label.trim() ? asset.label : 'Asset',
  value: toFiniteNumber(asset?.value, toFiniteNumber(asset?.balance, 0)),
})

export const normalizePlayerState = (player = {}) => {
  const initialized = initializePlayerState(player)
  const debts = Array.isArray(player.debts) ? player.debts.map(normalizeDebt) : initialized.debts
  const assets = Array.isArray(player.assets) ? player.assets.map(normalizeAsset) : initialized.assets
  const cash = toFiniteNumber(player.cash, initialized.cash)
  const physicalHealth = clamp(toFiniteNumber(player.physicalHealth, initialized.physicalHealth), 0, 100)
  const mentalHealth = clamp(toFiniteNumber(player.mentalHealth, initialized.mentalHealth), 0, 100)

  return {
    ...initialized,
    ...player,
    name: typeof player.name === 'string' ? player.name.trim() : initialized.name,
    cityId: initialized.cityId,
    jobId: initialized.jobId,
    age: Number.isInteger(player.age) && player.age >= 0 ? player.age : initialized.age,
    careerId: initialized.careerId,
    cash,
    debts,
    assets,
    netWorth: calculateNetWorth({ cash, assets, debts }),
    physicalHealth,
    mentalHealth,
    statusEffects: Array.isArray(player.statusEffects) ? player.statusEffects : initialized.statusEffects,
    actionHistory: Array.isArray(player.actionHistory) ? player.actionHistory : initialized.actionHistory,
  }
}
