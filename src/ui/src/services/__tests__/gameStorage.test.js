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

  it('preserves persisted player simulation state and turn logs', () => {
    window.localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'simulation-game',
          name: 'Simulation Game',
          status: 'active',
          players: [
            {
              id: 'player-1',
              name: 'Ari',
              avatar: 'fox',
              careerId: 'content-creator',
              cityId: 'suburbia',
              cash: 9236,
              debts: [],
              assets: [],
              netWorth: 9236,
              physicalHealth: 73,
              mentalHealth: 72,
              statusEffects: [],
              actionHistory: [{ id: 'action-1', actionType: 'pass' }],
            },
          ],
          turnNumber: 2,
          activePlayerIndex: 0,
          createdAt: 1,
          lastUpdated: 2,
          resumable: true,
          moveHistory: [],
          turnHistory: [{ id: 'turn-1', actionType: 'pass', totalDelta: { netWorth: 1736 } }],
        },
      ]),
    )

    expect(readStoredGamesSnapshot()).toEqual([
      expect.objectContaining({
        players: [
          expect.objectContaining({
            cash: 9236,
            netWorth: 9236,
            actionHistory: [expect.objectContaining({ actionType: 'pass' })],
          }),
        ],
        turnHistory: [expect.objectContaining({ id: 'turn-1', totalDelta: { netWorth: 1736 } })],
      }),
    ])
  })
})
