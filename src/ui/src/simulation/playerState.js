import {
  DEFAULT_PLAYER_TRAITS,
  buildWorldSettingsFromDifficulty,
  getCareerRule,
  getCityRule,
  resolveWorldSettingsEffects,
} from './definitions'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export const computeNetWorth = ({ cash, assets, debt }) => Math.round(cash + assets - debt)

export const createDefaultModifierContext = () => ({
  difficultyMode: 'normal',
  worldSettings: buildWorldSettingsFromDifficulty('normal'),
  enabledModifiers: [],
  schemaVersion: 2,
})

export const normalizeModifierContext = (modifierContext) => {
  const difficultyMode = modifierContext?.difficultyMode || modifierContext?.difficultyId || 'normal'
  const worldSettings = buildWorldSettingsFromDifficulty(difficultyMode, modifierContext?.worldSettings)

  return {
    difficultyMode,
    worldSettings,
    enabledModifiers: Array.isArray(modifierContext?.enabledModifiers) ? modifierContext.enabledModifiers : [],
    schemaVersion: Number.isInteger(modifierContext?.schemaVersion) ? modifierContext.schemaVersion : 2,
  }
}

export const createDefaultPlayerTraits = (traits = {}) => ({
  ...DEFAULT_PLAYER_TRAITS,
  ...traits,
})

export const initializePlayerState = (player, modifierContext = createDefaultModifierContext()) => {
  const careerRule = getCareerRule(player.jobId)
  const cityRule = getCityRule(player.cityId)
  const worldEffects = resolveWorldSettingsEffects(normalizeModifierContext(modifierContext).worldSettings)
  const monthlyIncome = Math.round(careerRule.monthlyIncome)
  const cash = Math.round(monthlyIncome * 0.8 + worldEffects.startCashFlat)
  const debt = Math.max(
    0,
    Math.round(player.educationTrackId === 'degree' ? monthlyIncome * 4.2 : monthlyIncome * 1.1) + worldEffects.startDebtFlat,
  )
  const assets = Math.max(0, Math.round(monthlyIncome * 0.6))
  const physicalHealth = clamp(70 + cityRule.physicalDrift, 0, 100)
  const mentalHealth = clamp(70 + cityRule.mentalDrift, 0, 100)
  const stress = clamp(30 + careerRule.stressDrift, 0, 100)

  return {
    ...player,
    age: Number.isFinite(player.age) ? player.age : 22,
    cash,
    debts: [{ id: 'starter-debt', label: 'Starter Debt', principal: debt, monthlyInterestRate: 0.0125 }],
    assets: [{ id: 'starter-assets', label: 'Starter Savings', value: assets }],
    debt,
    assetsValue: assets,
    netWorth: computeNetWorth({ cash, assets, debt }),
    monthlyIncome,
    physicalHealth,
    mentalHealth,
    stress,
    statusEffects: Array.isArray(player.statusEffects) ? player.statusEffects : [],
    actionHistory: Array.isArray(player.actionHistory) ? player.actionHistory : [],
    activeIssues: Array.isArray(player.activeIssues) ? player.activeIssues : [],
    playerTraits: createDefaultPlayerTraits(player.playerTraits),
    profileId: typeof player.profileId === 'string' && player.profileId ? player.profileId : 'none',
  }
}

export const normalizePlayerState = (player, modifierContext = createDefaultModifierContext()) => {
  const normalized = initializePlayerState(player, modifierContext)
  const cash = Number.isFinite(player.cash) ? Math.round(player.cash) : normalized.cash
  const debt = Number.isFinite(player.debt) ? Math.max(0, Math.round(player.debt)) : normalized.debt
  const assetsValue = Number.isFinite(player.assetsValue) ? Math.max(0, Math.round(player.assetsValue)) : normalized.assetsValue
  const monthlyIncome = Number.isFinite(player.monthlyIncome) ? Math.round(player.monthlyIncome) : normalized.monthlyIncome
  const physicalHealth = clamp(Number.isFinite(player.physicalHealth) ? player.physicalHealth : normalized.physicalHealth, 0, 100)
  const mentalHealth = clamp(Number.isFinite(player.mentalHealth) ? player.mentalHealth : normalized.mentalHealth, 0, 100)
  const stress = clamp(Number.isFinite(player.stress) ? player.stress : normalized.stress, 0, 100)

  return {
    ...normalized,
    ...player,
    cash,
    debt,
    assetsValue,
    netWorth: computeNetWorth({ cash, assets: assetsValue, debt }),
    monthlyIncome,
    physicalHealth,
    mentalHealth,
    stress,
    playerTraits: createDefaultPlayerTraits(player.playerTraits),
    profileId: typeof player.profileId === 'string' && player.profileId ? player.profileId : 'none',
    statusEffects: Array.isArray(player.statusEffects) ? player.statusEffects : [],
    actionHistory: Array.isArray(player.actionHistory) ? player.actionHistory : [],
    activeIssues: Array.isArray(player.activeIssues) ? player.activeIssues : [],
  }
}
