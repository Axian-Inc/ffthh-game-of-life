import { describe, expect, it } from 'vitest'
import {
  createInitialPlayerMoneyState,
  resolveMonthlyMoneyTurn,
  sumMonthlyExpenses,
} from '../playerFinanceCatalog'

describe('player finance catalog', () => {
  it('initializes starting money from education, job, and city choices', () => {
    const player = createInitialPlayerMoneyState({
      id: 'player-1',
      name: 'Mia',
      cityId: 'metro',
      educationTrackId: 'degree',
      jobId: 'software-engineer',
    })

    expect(player).toMatchObject({
      cash: 6000,
      monthlyIncome: 6200,
      netWorth: -24000,
      monthlyExpenses: {
        housing: 2700,
        utilities: 525,
        food: 975,
        transport: 600,
      },
      debts: [
        expect.objectContaining({
          id: 'education-debt',
          balance: 30000,
        }),
      ],
    })
  })

  it('resolves one monthly money turn with income and living costs', () => {
    const player = createInitialPlayerMoneyState({
      id: 'player-1',
      name: 'Ted',
      cityId: 'suburbia',
      educationTrackId: 'self-taught',
      jobId: 'content-creator',
    })

    expect(sumMonthlyExpenses(player.monthlyExpenses)).toBe(2520)

    const result = resolveMonthlyMoneyTurn(player)

    expect(result.player.cash).toBe(5280)
    expect(result.player.netWorth).toBe(5280)
    expect(result.moneyDelta).toMatchObject({
      cashBefore: 3000,
      income: 4800,
      expenses: 2520,
      netCashChange: 2280,
      cashAfter: 5280,
    })
  })
})
