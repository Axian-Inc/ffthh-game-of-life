import { beforeEach, describe, expect, it } from 'vitest'
import { GAME_STORAGE_KEY, readStoredGamesSnapshot } from '../gameStorage'

describe('gameStorage normalization', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('adds an empty move history for older saved games', () => {
    window.localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'legacy-game',
          name: 'Legacy Game',
          status: 'active',
          players: [{ id: 'player-1', name: 'Ari', avatar: 'fox' }],
          turnNumber: 2,
          activePlayerIndex: 0,
          createdAt: 1,
          lastUpdated: 2,
          resumable: true,
        },
      ]),
    )

    expect(readStoredGamesSnapshot()).toEqual([
      expect.objectContaining({
        id: 'legacy-game',
        moveHistory: [],
        players: [
          expect.objectContaining({
            id: 'player-1',
            careerId: 'content-creator',
            cash: 5000,
            netWorth: 5000,
            physicalHealth: 75,
            mentalHealth: 74,
          }),
        ],
      }),
    ])
  })

  it('normalizes persisted move history entries', () => {
    window.localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'history-game',
          name: 'History Game',
          status: 'active',
          players: [{ id: 'player-1', name: 'Ari', avatar: 'fox' }],
          turnNumber: 2,
          activePlayerIndex: 0,
          createdAt: 1,
          lastUpdated: 2,
          resumable: true,
          moveHistory: [
            {
              id: 42,
              playerId: 7,
              playerName: 'Ari',
              turnNumber: 2,
              actionType: 'pass',
              actionLabel: 'Pass',
              actionId: 99,
              createdAt: 123,
            },
          ],
        },
      ]),
    )

    expect(readStoredGamesSnapshot()).toEqual([
      expect.objectContaining({
        moveHistory: [
          expect.objectContaining({
            id: '42',
            playerId: '7',
            playerName: 'Ari',
            turnNumber: 2,
            actionType: 'pass',
            actionLabel: 'Pass',
            actionId: '99',
            createdAt: 123,
          }),
        ],
      }),
    ])
  })

  it('preserves rich turn resolution details in move history', () => {
    window.localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'resolution-game',
          name: 'Resolution Game',
          status: 'active',
          players: [{ id: 'player-1', name: 'Ari', avatar: 'fox' }],
          turnNumber: 2,
          activePlayerIndex: 0,
          createdAt: 1,
          lastUpdated: 2,
          resumable: true,
          moveHistory: [
            {
              id: 'move-1',
              playerId: 'player-1',
              playerName: 'Ari',
              turnNumber: 1,
              actionType: 'pass',
              actionLabel: 'Pass',
              createdAt: 123,
              turnResolution: {
                preTurnSnapshot: { cash: 5000 },
                phases: [{ id: 'income' }],
                explanations: ['Resolved pass.'],
                postTurnSnapshot: { cash: 7712 },
              },
            },
          ],
        },
      ]),
    )

    expect(readStoredGamesSnapshot()[0].moveHistory[0]).toEqual(
      expect.objectContaining({
        actionType: 'pass',
        turnResolution: expect.objectContaining({
          preTurnSnapshot: { cash: 5000 },
          phases: [{ id: 'income' }],
          postTurnSnapshot: { cash: 7712 },
        }),
      }),
    )
  })
})
