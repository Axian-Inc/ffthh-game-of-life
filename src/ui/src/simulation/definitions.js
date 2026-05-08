import { WIZARD_CAREER_BY_ID, WIZARD_CITY_BY_ID } from '../data/wizardVisualCatalog'

export const WORLD_SETTING_OPTIONS = {
  startingCushion: ['none', 'small', 'comfortable'],
  economicClimate: ['recession', 'stable', 'boom'],
  healthEnvironment: ['strained', 'neutral', 'supportive'],
  lifePace: ['fast', 'standard', 'calm'],
}

export const DIFFICULTY_PRESETS = {
  easy: {
    id: 'easy',
    label: 'Easy',
    worldSettings: {
      startingCushion: 'comfortable',
      economicClimate: 'boom',
      healthEnvironment: 'supportive',
      lifePace: 'calm',
    },
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    worldSettings: {
      startingCushion: 'small',
      economicClimate: 'stable',
      healthEnvironment: 'neutral',
      lifePace: 'standard',
    },
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    worldSettings: {
      startingCushion: 'none',
      economicClimate: 'recession',
      healthEnvironment: 'strained',
      lifePace: 'fast',
    },
  },
}

export const PLAYER_PROFILE_OPTIONS = [
  { id: 'none', label: 'No Profile', description: 'No additional realism profile modifiers.' },
  {
    id: 'adhd-pattern',
    label: 'ADHD Pattern',
    description: 'Creative upside with higher repetitive-task stress pressure.',
  },
  {
    id: 'autistic-pattern',
    label: 'Autistic Pattern',
    description: 'Stronger routine consistency with higher chaos-event stress.',
  },
  {
    id: 'dyslexic-pattern',
    label: 'Dyslexic Pattern',
    description: 'Practical-action strengths with text-heavy study friction.',
  },
  {
    id: 'anxiety-pattern',
    label: 'Anxiety Pattern',
    description: 'Planning strengths with heightened uncertainty penalties.',
  },
  {
    id: 'depressive-pattern',
    label: 'Depressive Pattern',
    description: 'Support-action gains with stronger low-mental-state drag.',
  },
]

export const PLAYER_PROFILE_RULES = {
  none: {},
  'adhd-pattern': {
    chooseActionAssetBonusMultiplier: 1.15,
    passStressFlat: 1,
  },
  'autistic-pattern': {
    randomVolatilityMultiplier: 0.95,
    randomStressDeltaFlat: 1,
  },
  'dyslexic-pattern': {
    chooseActionCashFlat: 60,
    chooseActionStressFlat: 1,
  },
  'anxiety-pattern': {
    debtPaymentMultiplier: 1.1,
    randomMentalDeltaFlat: -1,
  },
  'depressive-pattern': {
    chooseActionMentalFlat: 1,
    lowMentalIncomeMultiplierBelow40: 0.92,
  },
}

const WORLD_SETTING_EFFECTS = {
  startingCushion: {
    none: { startCashFlat: 0, startDebtFlat: 1000 },
    small: { startCashFlat: 1500, startDebtFlat: 0 },
    comfortable: { startCashFlat: 3500, startDebtFlat: -500 },
  },
  economicClimate: {
    recession: { incomeMultiplier: 0.94, monthlyExpenseMultiplier: 1.05, randomVolatilityMultiplier: 1.2 },
    stable: { incomeMultiplier: 1, monthlyExpenseMultiplier: 1, randomVolatilityMultiplier: 1 },
    boom: { incomeMultiplier: 1.06, monthlyExpenseMultiplier: 0.98, randomVolatilityMultiplier: 1.1 },
  },
  healthEnvironment: {
    strained: { physicalDriftBonus: -1, mentalDriftBonus: -1, stressDriftBonus: 1 },
    neutral: { physicalDriftBonus: 0, mentalDriftBonus: 0, stressDriftBonus: 0 },
    supportive: { physicalDriftBonus: 1, mentalDriftBonus: 1, stressDriftBonus: -1 },
  },
  lifePace: {
    fast: { stressDriftBonus: 1, randomVolatilityMultiplier: 1.2 },
    standard: { stressDriftBonus: 0, randomVolatilityMultiplier: 1 },
    calm: { stressDriftBonus: -1, randomVolatilityMultiplier: 0.9 },
  },
}

const CAREER_RULES = {
  'software-engineer': { monthlyIncome: 6200, recurringCostBase: 2450, stressDrift: 2, physicalDrift: -1, mentalDrift: -1 },
  'registered-nurse': { monthlyIncome: 5680, recurringCostBase: 2380, stressDrift: 1, physicalDrift: -1, mentalDrift: 0 },
  'financial-analyst': {
    monthlyIncome: 6000,
    recurringCostBase: 2460,
    stressDrift: 2,
    physicalDrift: -1,
    mentalDrift: -1,
  },
  electrician: { monthlyIncome: 5000, recurringCostBase: 2100, stressDrift: 1, physicalDrift: 0, mentalDrift: 0 },
  'hvac-technician': { monthlyIncome: 4720, recurringCostBase: 2050, stressDrift: 1, physicalDrift: 0, mentalDrift: 0 },
  plumber: { monthlyIncome: 4840, recurringCostBase: 2080, stressDrift: 1, physicalDrift: 0, mentalDrift: 0 },
  entrepreneur: { monthlyIncome: 5600, recurringCostBase: 2300, stressDrift: 2, physicalDrift: -1, mentalDrift: -1 },
  musician: { monthlyIncome: 4000, recurringCostBase: 1850, stressDrift: 0, physicalDrift: 0, mentalDrift: 1 },
  'content-creator': { monthlyIncome: 4800, recurringCostBase: 2000, stressDrift: 1, physicalDrift: 0, mentalDrift: 0 },
}

const CITY_RULES = {
  metro: { costMultiplier: 1.45, taxRate: 0.22, mentalDrift: -1, physicalDrift: -1 },
  suburbia: { costMultiplier: 1, taxRate: 0.16, mentalDrift: 0, physicalDrift: 0 },
  'small-town': { costMultiplier: 0.82, taxRate: 0.12, mentalDrift: 0, physicalDrift: 1 },
}

export const DEFAULT_PLAYER_TRAITS = {
  grit: 0,
  focus: 0,
  resilience: 0,
  riskTolerance: 0,
}

export const getDifficultyPreset = (difficultyId) => DIFFICULTY_PRESETS[difficultyId] || DIFFICULTY_PRESETS.normal

export const buildWorldSettingsFromDifficulty = (difficultyMode = 'normal', worldSettings = {}) => {
  if (difficultyMode === 'custom') {
    const safeSettings = {}
    Object.keys(WORLD_SETTING_OPTIONS).forEach((key) => {
      const optionSet = new Set(WORLD_SETTING_OPTIONS[key])
      const fallback = DIFFICULTY_PRESETS.normal.worldSettings[key]
      safeSettings[key] = optionSet.has(worldSettings[key]) ? worldSettings[key] : fallback
    })
    return safeSettings
  }
  return { ...(getDifficultyPreset(difficultyMode).worldSettings || DIFFICULTY_PRESETS.normal.worldSettings) }
}

export const resolveWorldSettingsEffects = (worldSettings) => {
  const effects = {
    incomeMultiplier: 1,
    monthlyExpenseMultiplier: 1,
    randomVolatilityMultiplier: 1,
    physicalDriftBonus: 0,
    mentalDriftBonus: 0,
    stressDriftBonus: 0,
    startCashFlat: 0,
    startDebtFlat: 0,
  }

  Object.entries(worldSettings || {}).forEach(([settingKey, settingValue]) => {
    const settingEffects = WORLD_SETTING_EFFECTS[settingKey]?.[settingValue]
    if (!settingEffects) {
      return
    }
    Object.entries(settingEffects).forEach(([key, value]) => {
      if (key.includes('Multiplier')) {
        effects[key] *= value
      } else {
        effects[key] += value
      }
    })
  })

  return {
    ...effects,
    incomeMultiplier: Math.max(0.75, Math.min(1.3, effects.incomeMultiplier)),
    monthlyExpenseMultiplier: Math.max(0.8, Math.min(1.35, effects.monthlyExpenseMultiplier)),
    randomVolatilityMultiplier: Math.max(0.7, Math.min(1.4, effects.randomVolatilityMultiplier)),
  }
}

export const getPlayerProfileRule = (profileId = 'none') => PLAYER_PROFILE_RULES[profileId] || PLAYER_PROFILE_RULES.none

export const getCareerRule = (jobId) => CAREER_RULES[jobId] || CAREER_RULES['content-creator']

export const getCityRule = (cityId) => CITY_RULES[cityId] || CITY_RULES.suburbia

export const getCareerLabel = (jobId) => WIZARD_CAREER_BY_ID[jobId]?.title || 'Career'

export const getCityLabel = (cityId) => WIZARD_CITY_BY_ID[cityId]?.name || 'City'
