export const CITY_EXPENSE_MULTIPLIERS = {
  metro: 1.5,
  suburbia: 1,
  'small-town': 0.8,
}

export const PLAYER_FINANCE_DEFINITIONS = [
  {
    jobId: 'software-engineer',
    educationTrackId: 'degree',
    startingCash: 6000,
    startingDebt: 30000,
    monthlyIncome: 6200,
    monthlyExpenses: {
      housing: 1800,
      utilities: 350,
      food: 650,
      transport: 400,
    },
  },
  {
    jobId: 'registered-nurse',
    educationTrackId: 'degree',
    startingCash: 5500,
    startingDebt: 24000,
    monthlyIncome: 5680,
    monthlyExpenses: {
      housing: 1700,
      utilities: 330,
      food: 640,
      transport: 380,
    },
  },
  {
    jobId: 'financial-analyst',
    educationTrackId: 'degree',
    startingCash: 5800,
    startingDebt: 28000,
    monthlyIncome: 6000,
    monthlyExpenses: {
      housing: 1750,
      utilities: 340,
      food: 650,
      transport: 390,
    },
  },
  {
    jobId: 'electrician',
    educationTrackId: 'trades',
    startingCash: 4500,
    startingDebt: 5000,
    monthlyIncome: 5000,
    monthlyExpenses: {
      housing: 1450,
      utilities: 300,
      food: 600,
      transport: 380,
    },
  },
  {
    jobId: 'hvac-technician',
    educationTrackId: 'trades',
    startingCash: 4300,
    startingDebt: 4000,
    monthlyIncome: 4720,
    monthlyExpenses: {
      housing: 1400,
      utilities: 300,
      food: 590,
      transport: 390,
    },
  },
  {
    jobId: 'plumber',
    educationTrackId: 'trades',
    startingCash: 4400,
    startingDebt: 4500,
    monthlyIncome: 4840,
    monthlyExpenses: {
      housing: 1425,
      utilities: 300,
      food: 600,
      transport: 390,
    },
  },
  {
    jobId: 'entrepreneur',
    educationTrackId: 'self-taught',
    startingCash: 3500,
    startingDebt: 2000,
    monthlyIncome: 5600,
    monthlyExpenses: {
      housing: 1500,
      utilities: 310,
      food: 620,
      transport: 360,
    },
  },
  {
    jobId: 'musician',
    educationTrackId: 'self-taught',
    startingCash: 2500,
    startingDebt: 0,
    monthlyIncome: 4000,
    monthlyExpenses: {
      housing: 1250,
      utilities: 280,
      food: 560,
      transport: 280,
    },
  },
  {
    jobId: 'content-creator',
    educationTrackId: 'self-taught',
    startingCash: 3000,
    startingDebt: 0,
    monthlyIncome: 4800,
    monthlyExpenses: {
      housing: 1350,
      utilities: 290,
      food: 580,
      transport: 300,
    },
  },
]

const DEFAULT_FINANCE_DEFINITION = PLAYER_FINANCE_DEFINITIONS.find(
  (definition) => definition.jobId === 'content-creator',
)

const toDollars = (value, fallback = 0) => {
  if (!Number.isFinite(value)) {
    return fallback
  }
  return Math.round(value)
}

export const getFinanceDefinitionForPlayer = (player = {}) => {
  const exactMatch = PLAYER_FINANCE_DEFINITIONS.find(
    (definition) => definition.jobId === player.jobId && definition.educationTrackId === player.educationTrackId,
  )
  if (exactMatch) {
    return exactMatch
  }

  return PLAYER_FINANCE_DEFINITIONS.find((definition) => definition.jobId === player.jobId) || DEFAULT_FINANCE_DEFINITION
}

export const getCityExpenseMultiplier = (cityId) => CITY_EXPENSE_MULTIPLIERS[cityId] || 1

export const buildMonthlyExpenses = (player = {}) => {
  const definition = getFinanceDefinitionForPlayer(player)
  const multiplier = getCityExpenseMultiplier(player.cityId)

  return Object.fromEntries(
    Object.entries(definition.monthlyExpenses).map(([key, value]) => [key, toDollars(value * multiplier)]),
  )
}

export const sumDollars = (items = []) =>
  items.reduce((total, item) => total + toDollars(item?.value ?? item?.balance ?? item?.amount), 0)

export const sumMonthlyExpenses = (monthlyExpenses = {}) =>
  Object.values(monthlyExpenses).reduce((total, value) => total + toDollars(value), 0)

export const calculateNetWorth = ({ cash = 0, assets = [], debts = [] } = {}) =>
  toDollars(cash) + sumDollars(assets) - sumDollars(debts)

export const createInitialPlayerMoneyState = (player = {}) => {
  const definition = getFinanceDefinitionForPlayer(player)
  const cash = toDollars(definition.startingCash)
  const debts = definition.startingDebt > 0
    ? [
        {
          id: 'education-debt',
          label: 'Education Debt',
          balance: toDollars(definition.startingDebt),
        },
      ]
    : []
  const assets = []
  const monthlyExpenses = buildMonthlyExpenses(player)

  return {
    ...player,
    age: Number.isInteger(player.age) ? player.age : 18,
    cash,
    debts,
    assets,
    netWorth: calculateNetWorth({ cash, assets, debts }),
    monthlyIncome: toDollars(definition.monthlyIncome),
    monthlyExpenses,
    physicalHealth: Number.isFinite(player.physicalHealth) ? player.physicalHealth : 80,
    mentalHealth: Number.isFinite(player.mentalHealth) ? player.mentalHealth : 80,
    statusEffects: Array.isArray(player.statusEffects) ? player.statusEffects : [],
    actionHistory: Array.isArray(player.actionHistory) ? player.actionHistory : [],
  }
}

export const ensurePlayerMoneyState = (player = {}) => {
  if (Number.isFinite(player.cash) && Number.isFinite(player.monthlyIncome) && player.monthlyExpenses) {
    const debts = Array.isArray(player.debts) ? player.debts : []
    const assets = Array.isArray(player.assets) ? player.assets : []
    return {
      ...player,
      debts,
      assets,
      monthlyExpenses: player.monthlyExpenses,
      netWorth: calculateNetWorth({ cash: player.cash, assets, debts }),
      statusEffects: Array.isArray(player.statusEffects) ? player.statusEffects : [],
      actionHistory: Array.isArray(player.actionHistory) ? player.actionHistory : [],
    }
  }

  return createInitialPlayerMoneyState(player)
}

export const resolveMonthlyMoneyTurn = (player = {}) => {
  const preparedPlayer = ensurePlayerMoneyState(player)
  const income = toDollars(preparedPlayer.monthlyIncome)
  const expenses = sumMonthlyExpenses(preparedPlayer.monthlyExpenses)
  const cashBefore = toDollars(preparedPlayer.cash)
  const cashAfter = cashBefore + income - expenses
  const nextPlayer = {
    ...preparedPlayer,
    cash: cashAfter,
    netWorth: calculateNetWorth({ cash: cashAfter, assets: preparedPlayer.assets, debts: preparedPlayer.debts }),
  }

  return {
    player: nextPlayer,
    moneyDelta: {
      cashBefore,
      income,
      expenses,
      netCashChange: income - expenses,
      cashAfter,
      netWorthAfter: nextPlayer.netWorth,
    },
    summary: `Income added $${income.toLocaleString()} and living costs used $${expenses.toLocaleString()}.`,
  }
}
