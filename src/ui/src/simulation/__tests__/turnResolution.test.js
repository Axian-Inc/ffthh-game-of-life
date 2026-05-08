import { describe, expect, it } from 'vitest'
import { initializePlayerState } from '../playerState'
import { resolvePassTurn } from '../turnResolution'

describe('pass turn resolution', () => {
  it('applies monthly income, recurring costs, and post-turn net worth', () => {
    const player = initializePlayerState({ id: 'player-1', cityId: 'suburbia', jobId: 'content-creator' })
    const { updatedPlayer, turnResolution } = resolvePassTurn({
      game: { players: [player] },
      activePlayerIndex: 0,
      turnNumber: 1,
      timestamp: 1000,
    })

    expect(updatedPlayer).toMatchObject({
      cash: 7712,
      debts: [],
      netWorth: 7712,
      physicalHealth: 75,
      mentalHealth: 74,
      actionHistory: [
        expect.objectContaining({
          actionType: 'pass',
          actionLabel: 'Pass',
          turnNumber: 1,
          createdAt: 1000,
        }),
      ],
    })
    expect(turnResolution.preTurnSnapshot).toEqual(expect.objectContaining({ cash: 5000, netWorth: 5000 }))
    expect(turnResolution.postTurnSnapshot).toEqual(expect.objectContaining({ cash: 7712, netWorth: 7712 }))
    expect(turnResolution.phases.map((phase) => phase.id)).toEqual([
      'income',
      'recurring-costs',
      'debt-interest',
      'debt-payment',
      'health',
      'event',
      'action',
    ])
  })

  it('accrues debt interest, makes minimum payments, and applies health drift', () => {
    const player = initializePlayerState({ id: 'player-1', cityId: 'metro', jobId: 'software-engineer' })
    const { updatedPlayer, turnResolution } = resolvePassTurn({
      game: { players: [player] },
      activePlayerIndex: 0,
      turnNumber: 2,
      timestamp: 2000,
    })

    expect(updatedPlayer).toMatchObject({
      cash: 11975,
      netWorth: -17875,
      physicalHealth: 73,
      mentalHealth: 71,
    })
    expect(updatedPlayer.debts).toEqual([
      expect.objectContaining({
        id: 'software-engineer-starting-debt',
        balance: 29850,
      }),
    ])
    expect(turnResolution.phases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'debt-interest', deltas: { debt: 150 } }),
        expect.objectContaining({ id: 'debt-payment', deltas: { cash: -300, debt: -300 } }),
        expect.objectContaining({ id: 'health', deltas: { physicalHealth: -1, mentalHealth: -2 } }),
      ]),
    )
  })

  it('clamps health values at bounds', () => {
    const player = initializePlayerState({ id: 'player-1', cityId: 'metro', jobId: 'software-engineer' })
    const { updatedPlayer } = resolvePassTurn({
      game: { players: [{ ...player, physicalHealth: 0, mentalHealth: 0 }] },
      activePlayerIndex: 0,
      turnNumber: 1,
      timestamp: 3000,
    })

    expect(updatedPlayer.physicalHealth).toBe(0)
    expect(updatedPlayer.mentalHealth).toBe(0)
  })
})
