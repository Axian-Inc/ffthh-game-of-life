import { describe, expect, it } from 'vitest'
import { calculateNetWorth, initializePlayerState, normalizePlayerState } from '../playerState'

describe('player state initialization', () => {
  it('initializes a player from valid city and career selections', () => {
    const player = initializePlayerState({
      id: 'player-1',
      name: ' Ted ',
      avatar: 'fox',
      cityId: 'metro',
      educationTrackId: 'degree',
      jobId: 'software-engineer',
    })

    expect(player).toMatchObject({
      id: 'player-1',
      name: 'Ted',
      avatar: 'fox',
      cityId: 'metro',
      educationTrackId: 'degree',
      jobId: 'software-engineer',
      age: 18,
      careerId: 'software-engineer',
      cash: 8000,
      netWorth: -22000,
      physicalHealth: 74,
      mentalHealth: 73,
      statusEffects: [],
      actionHistory: [],
    })
    expect(player.assets).toEqual([])
    expect(player.debts).toEqual([
      {
        id: 'software-engineer-starting-debt',
        label: 'Student debt',
        type: 'student-loan',
        balance: 30000,
        annualInterestRate: 0.06,
        minimumMonthlyPayment: 300,
      },
    ])
  })

  it('creates no starting debt for a zero-debt career', () => {
    const player = initializePlayerState({ cityId: 'suburbia', jobId: 'content-creator' })

    expect(player).toMatchObject({
      careerId: 'content-creator',
      cash: 5000,
      debts: [],
      netWorth: 5000,
      physicalHealth: 75,
      mentalHealth: 74,
    })
  })

  it('falls back safely when setup ids are missing or invalid', () => {
    const player = initializePlayerState({ cityId: 'unknown-city', jobId: 'unknown-career' })

    expect(player).toMatchObject({
      cityId: 'suburbia',
      jobId: 'content-creator',
      careerId: 'content-creator',
      cash: 5000,
      debts: [],
      netWorth: 5000,
    })
  })

  it('calculates net worth from cash, assets, and debts', () => {
    expect(
      calculateNetWorth({
        cash: 1000,
        assets: [
          { id: 'stocks', value: 2500 },
          { id: 'car', balance: 5000 },
        ],
        debts: [
          { id: 'card', balance: 600 },
          { id: 'loan', value: 900 },
        ],
      }),
    ).toBe(7000)
  })

  it('normalizes legacy players with simulation defaults', () => {
    const player = normalizePlayerState({ id: 'player-1', name: ' Ari ', avatar: 'fox' })

    expect(player).toMatchObject({
      id: 'player-1',
      name: 'Ari',
      avatar: 'fox',
      cityId: 'suburbia',
      jobId: 'content-creator',
      careerId: 'content-creator',
      age: 18,
      cash: 5000,
      debts: [],
      assets: [],
      netWorth: 5000,
      physicalHealth: 75,
      mentalHealth: 74,
      statusEffects: [],
      actionHistory: [],
    })
  })

  it('preserves existing simulation values while recalculating net worth', () => {
    const player = normalizePlayerState({
      id: 'player-1',
      cityId: 'metro',
      careerId: 'software-engineer',
      cash: 2000,
      assets: [{ id: 'stocks', label: 'Stocks', value: 3000 }],
      debts: [{ id: 'card', label: 'Credit card', type: 'credit-card', balance: 750, minimumMonthlyPayment: 75 }],
      physicalHealth: 80,
      mentalHealth: 60,
      actionHistory: [{ id: 'action-1' }],
    })

    expect(player).toMatchObject({
      cityId: 'metro',
      jobId: 'software-engineer',
      careerId: 'software-engineer',
      cash: 2000,
      netWorth: 4250,
      physicalHealth: 80,
      mentalHealth: 60,
      actionHistory: [{ id: 'action-1' }],
    })
    expect(player.debts[0]).toEqual(
      expect.objectContaining({
        id: 'card',
        balance: 750,
        annualInterestRate: 0.06,
        minimumMonthlyPayment: 75,
      }),
    )
  })
})
