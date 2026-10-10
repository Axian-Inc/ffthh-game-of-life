import { describe, expect, it } from 'vitest'
import { calculateNetWorth, initializePlayerState } from './playerState'

describe('player state', () => {
  it('initializes financial and health state from canonical career and city definitions', () => {
    expect(
      initializePlayerState({
        id: 'player-1',
        name: ' Ari ',
        avatar: 'fox',
        cityId: 'metro',
        educationTrackId: 'degree',
        jobId: 'software-engineer',
      }),
    ).toEqual(
      expect.objectContaining({
        id: 'player-1',
        name: 'Ari',
        age: 18,
        cityId: 'metro',
        careerId: 'software-engineer',
        jobId: 'software-engineer',
        cash: 4000,
        netWorth: -26000,
        physicalHealth: 50,
        mentalHealth: 39,
        assets: [],
        statusEffects: [],
        actionHistory: [],
        debts: [
          expect.objectContaining({
            id: 'player-1-starting-debt',
            type: 'student',
            balance: 30000,
          }),
        ],
      }),
    )
  })

  it('preserves saved collections, clamps health, and recalculates net worth', () => {
    const player = initializePlayerState({
      id: 'player-2',
      cityId: 'small-town',
      jobId: 'musician',
      cash: 100,
      assets: [{ id: 'savings', currentValue: 250 }],
      debts: [{ id: 'loan', balance: 75 }],
      physicalHealth: 140,
      mentalHealth: -12,
      statusEffects: [{ id: 'rested' }],
      actionHistory: [{ id: 'action-1' }],
    })

    expect(player).toMatchObject({
      cash: 100,
      netWorth: 275,
      physicalHealth: 100,
      mentalHealth: 0,
      statusEffects: [{ id: 'rested' }],
      actionHistory: [{ id: 'action-1' }],
    })
  })

  it('calculates net worth across supported asset and debt value fields', () => {
    expect(
      calculateNetWorth({
        cash: 500,
        assets: [{ currentValue: 200 }, { value: 300 }, { balance: 100 }],
        debts: [{ balance: 250 }, { amount: 50 }],
      }),
    ).toBe(800)
  })
})

