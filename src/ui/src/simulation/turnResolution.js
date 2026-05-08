import { CAREER_DEFINITION_BY_ID, CITY_DEFINITION_BY_ID } from '../data/simulationDefinitions'
import { calculateNetWorth, normalizePlayerState } from './playerState'

const BASE_MONTHLY_LIVING_COST = 1800

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const roundCurrency = (value) => Math.round(value * 100) / 100

const getSnapshot = (player) => ({
  cash: player.cash,
  debts: player.debts.map((debt) => ({ ...debt })),
  assets: player.assets.map((asset) => ({ ...asset })),
  netWorth: player.netWorth,
  physicalHealth: player.physicalHealth,
  mentalHealth: player.mentalHealth,
})

const getDebtTotal = (debts) => debts.reduce((total, debt) => total + debt.balance, 0)

export const resolvePassTurn = ({ game, activePlayerIndex, turnNumber, timestamp }) => {
  const players = Array.isArray(game?.players) ? game.players : []
  const activePlayer = normalizePlayerState(players[activePlayerIndex])
  const career = CAREER_DEFINITION_BY_ID[activePlayer.careerId]
  const city = CITY_DEFINITION_BY_ID[activePlayer.cityId]
  const preTurnSnapshot = getSnapshot(activePlayer)
  const phases = []
  const explanations = []

  let cash = activePlayer.cash
  let debts = activePlayer.debts.map((debt) => ({ ...debt }))
  const assets = activePlayer.assets.map((asset) => ({ ...asset }))
  let physicalHealth = activePlayer.physicalHealth
  let mentalHealth = activePlayer.mentalHealth

  const monthlyGrossIncome = roundCurrency(career.weeklyIncome * 4 * city.opportunityMultiplier)
  const taxes = roundCurrency(monthlyGrossIncome * city.taxRate)
  const netIncome = roundCurrency(monthlyGrossIncome - taxes)
  cash = roundCurrency(cash + netIncome)
  phases.push({
    id: 'income',
    label: 'Income',
    deltas: { cash: netIncome },
    explanations: [
      `${career.label} income produced $${monthlyGrossIncome.toLocaleString()} before $${taxes.toLocaleString()} in city taxes.`,
    ],
  })

  const recurringCosts = roundCurrency(BASE_MONTHLY_LIVING_COST * city.costOfLivingMultiplier)
  cash = roundCurrency(cash - recurringCosts)
  phases.push({
    id: 'recurring-costs',
    label: 'Recurring costs',
    deltas: { cash: -recurringCosts },
    explanations: [`${city.label} living costs were $${recurringCosts.toLocaleString()} this month.`],
  })

  let debtInterest = 0
  debts = debts.map((debt) => {
    const interest = roundCurrency(debt.balance * (debt.annualInterestRate / 12))
    debtInterest = roundCurrency(debtInterest + interest)
    return {
      ...debt,
      balance: roundCurrency(debt.balance + interest),
    }
  })
  phases.push({
    id: 'debt-interest',
    label: 'Debt interest',
    deltas: { debt: debtInterest },
    explanations: debtInterest > 0 ? [`Debt balances accrued $${debtInterest.toLocaleString()} in interest.`] : ['No debt interest accrued.'],
  })

  let debtPayments = 0
  const paymentExplanations = []
  debts = debts
    .map((debt) => {
      const requiredPayment = Math.min(debt.minimumMonthlyPayment, debt.balance)
      const availablePayment = Math.max(0, cash)
      const payment = roundCurrency(Math.min(requiredPayment, availablePayment))
      cash = roundCurrency(cash - payment)
      debtPayments = roundCurrency(debtPayments + payment)

      if (payment < requiredPayment) {
        paymentExplanations.push(
          `${debt.label} received $${payment.toLocaleString()} of the $${requiredPayment.toLocaleString()} minimum payment.`,
        )
      }

      return {
        ...debt,
        balance: roundCurrency(debt.balance - payment),
      }
    })
    .filter((debt) => debt.balance > 0)
  phases.push({
    id: 'debt-payment',
    label: 'Debt payment',
    deltas: { cash: -debtPayments, debt: -debtPayments },
    explanations: paymentExplanations.length
      ? paymentExplanations
      : debtPayments > 0
        ? [`Paid $${debtPayments.toLocaleString()} toward required debt minimums.`]
        : ['No debt payment was due.'],
  })

  const financialStressPenalty = cash < 0 || getDebtTotal(debts) > Math.max(career.weeklyIncome * 8, 1) ? 1 : 0
  const physicalHealthDelta = Math.sign(city.physicalBaseline)
  const mentalHealthDelta = Math.sign(city.mentalBaseline) - financialStressPenalty
  physicalHealth = clamp(physicalHealth + physicalHealthDelta, 0, 100)
  mentalHealth = clamp(mentalHealth + mentalHealthDelta, 0, 100)
  phases.push({
    id: 'health',
    label: 'Health drift',
    deltas: { physicalHealth: physicalHealthDelta, mentalHealth: mentalHealthDelta },
    explanations: [`Health drift reflected ${city.shortName} city conditions and current financial pressure.`],
  })

  phases.push({
    id: 'event',
    label: 'Event',
    deltas: {},
    explanations: ['No life event was resolved this turn.'],
  })

  phases.push({
    id: 'action',
    label: 'Player action',
    deltas: {},
    explanations: ['Player passed with no additional action.'],
  })

  const netWorth = calculateNetWorth({ cash, assets, debts })
  const updatedPlayer = {
    ...activePlayer,
    cash,
    debts,
    assets,
    netWorth,
    physicalHealth,
    mentalHealth,
    actionHistory: [
      ...activePlayer.actionHistory,
      {
        id: `action-${timestamp}`,
        actionType: 'pass',
        actionLabel: 'Pass',
        turnNumber,
        createdAt: timestamp,
      },
    ],
  }
  const postTurnSnapshot = getSnapshot(updatedPlayer)

  explanations.push(
    `Started at net worth $${preTurnSnapshot.netWorth.toLocaleString()} and ended at $${postTurnSnapshot.netWorth.toLocaleString()}.`,
  )

  return {
    updatedPlayer,
    turnResolution: {
      preTurnSnapshot,
      phases,
      explanations,
      postTurnSnapshot,
    },
  }
}
