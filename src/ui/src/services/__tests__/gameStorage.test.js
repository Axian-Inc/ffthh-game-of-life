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
            createdAt: 123,
          }),
        ],
      }),
    ])
  })
})
