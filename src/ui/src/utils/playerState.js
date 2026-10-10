import { CAREER_DEFINITION_BY_ID, CITY_DEFINITION_BY_ID } from '../data/simulationDefinitions'
import { DEFAULT_CITY_ID, DEFAULT_EDUCATION_TRACK_ID, DEFAULT_JOB_ID } from './gameValidation'

export const DEFAULT_PLAYER_AGE = 18
export const DEFAULT_PHYSICAL_HEALTH = 60
export const DEFAULT_MENTAL_HEALTH = 60

const toFiniteNumber = (value, fallback = 0) => (Number.isFinite(value) ? value : fallback)

export const clampHealth = (value, fallback = 0) => Math.min(100, Math.max(0, toFiniteNumber(value, fallback)))

const getAssetValue = (asset) => {
  if (Number.isFinite(asset?.currentValue)) {
    return asset.currentValue
  }
  if (Number.isFinite(asset?.value)) {
    return asset.value
  }
  return Number.isFinite(asset?.balance) ? asset.balance : 0
}

const getDebtBalance = (debt) => {
  if (Number.isFinite(debt?.balance)) {
    return debt.balance
  }
  return Number.isFinite(debt?.amount) ? debt.amount : 0
}

export const calculateNetWorth = ({ cash = 0, assets = [], debts = [] } = {}) => {
  const assetValue = Array.isArray(assets) ? assets.reduce((total, asset) => total + getAssetValue(asset), 0) : 0
  const debtBalance = Array.isArray(debts) ? debts.reduce((total, debt) => total + getDebtBalance(debt), 0) : 0
  return toFiniteNumber(cash) + assetValue - debtBalance
}

const createStartingDebt = (playerId, career) => {
  if (career.startDebt <= 0) {
    return []
  }

  return [
    {
      id: `${playerId}-starting-debt`,
      type: career.trackId === 'degree' ? 'student' : 'training',
      label: `${career.label} education and training debt`,
      balance: career.startDebt,
      annualInterestRate: career.trackId === 'degree' ? 0.05 : 0.04,
      minimumPayment: Math.ceil(career.startDebt * 0.005),
    },
  ]
}

const normalizeCollection = (value) => (Array.isArray(value) ? value.map((item) => ({ ...item })) : [])

export const initializePlayerState = (player, index = 0) => {
  const id = player?.id != null ? String(player.id) : `player-${index + 1}`
  const cityId = CITY_DEFINITION_BY_ID[player?.cityId] ? player.cityId : DEFAULT_CITY_ID
  const careerIdCandidate = player?.careerId || player?.jobId
  const careerId = CAREER_DEFINITION_BY_ID[careerIdCandidate] ? careerIdCandidate : DEFAULT_JOB_ID
  const city = CITY_DEFINITION_BY_ID[cityId]
  const career = CAREER_DEFINITION_BY_ID[careerId]
  const assets = player?.assets == null ? [] : normalizeCollection(player.assets)
  const debts = player?.debts == null ? createStartingDebt(id, career) : normalizeCollection(player.debts)
  const cash = toFiniteNumber(player?.cash, career.startCash)
  const physicalHealth = clampHealth(
    player?.physicalHealth,
    career.startingPhysicalHealth + city.physicalBaseline,
  )
  const mentalHealth = clampHealth(player?.mentalHealth, career.startingMentalHealth + city.mentalBaseline)
  const educationTrackId =
    player?.educationTrackId === career.trackId ? player.educationTrackId : career.trackId || DEFAULT_EDUCATION_TRACK_ID

  return {
    ...player,
    id,
    name: typeof player?.name === 'string' ? player.name.trim() : '',
    avatar: player?.avatar || '',
    age: Number.isInteger(player?.age) && player.age >= 0 ? player.age : DEFAULT_PLAYER_AGE,
    cityId,
    educationTrackId,
    jobId: careerId,
    careerId,
    careerTrack: player?.careerTrack || career.label,
    cash,
    debts,
    assets,
    netWorth: calculateNetWorth({ cash, assets, debts }),
    physicalHealth,
    mentalHealth,
    statusEffects: normalizeCollection(player?.statusEffects),
    actionHistory: normalizeCollection(player?.actionHistory),
  }
}

export const normalizePlayers = (players) =>
  (Array.isArray(players) ? players : []).map((player, index) => initializePlayerState(player, index))
