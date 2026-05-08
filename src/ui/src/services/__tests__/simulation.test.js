import { describe, expect, it } from 'vitest'
import { calculateNetWorth, initializePlayerState, resolveNoActionTurn } from '../simulation'

describe('simulation foundations', () => {
  it('initializes full player state from wizard selections', () => {
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
      age: 18,
      cityId: 'metro',
      careerId: 'software-engineer',
      jobId: 'software-engineer',
      cash: 12000,
      physicalHealth: 70,
      mentalHealth: 69,
      statusEffects: [],
      actionHistory: [],
    })
    expect(player.debts).toEqual([
      expect.objectContaining({
        id: 'software-engineer-starter-debt',
        label: 'Student loan',
        balance: 30000,
      }),
    ])
    expect(player.netWorth).toBe(-18000)
  })

  it('calculates net worth from cash, assets, and debts', () => {
    expect(
      calculateNetWorth({
        cash: 500,
        assets: [{ value: 1200 }, { value: 300 }],
        debts: [{ balance: 700 }, { balance: 100 }],
      }),
    ).toBe(1200)
  })

  it('resolves a deterministic no-action monthly turn', () => {
    const player = initializePlayerState({
      id: 'player-1',
      name: 'Ari',
      avatar: 'fox',
      cityId: 'suburbia',
      jobId: 'content-creator',
    })

    const resolved = resolveNoActionTurn({
      player,
      turnNumber: 1,
      actionType: 'pass',
      actionLabel: 'Pass',
      createdAt: 100,
    })

    expect(resolved.player).toMatchObject({
      id: 'player-1',
      cash: 9236,
      netWorth: 9236,
      physicalHealth: 73,
      mentalHealth: 72,
    })
    expect(resolved.player.actionHistory).toEqual([
      expect.objectContaining({
        turnNumber: 1,
        actionType: 'pass',
        actionLabel: 'Pass',
        createdAt: 100,
      }),
    ])
    expect(resolved.turnLogEntry).toMatchObject({
      playerId: 'player-1',
      playerName: 'Ari',
      turnNumber: 1,
      actionType: 'pass',
      preTurnSnapshot: expect.objectContaining({ cash: 7500, netWorth: 7500 }),
      postTurnSnapshot: expect.objectContaining({ cash: 9236, netWorth: 9236 }),
      totalDelta: expect.objectContaining({ cash: 1736, netWorth: 1736 }),
      createdAt: 100,
    })
    expect(resolved.turnLogEntry.phases.map((phase) => phase.id)).toEqual([
      'net-worth',
      'debt-updates',
      'health',
      'event',
      'action',
    ])
  })
})
