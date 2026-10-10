import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GAME_STORAGE_KEY, createGameStorage, readStoredGamesSnapshot } from '../gameStorage'

describe('gameStorage normalization', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds version and event-ready player state for older saved games', () => {
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
        version: 1,
        moveHistory: [],
        players: [
          expect.objectContaining({
            id: 'player-1',
            cityId: 'suburbia',
            careerId: 'content-creator',
            cash: 3000,
            debts: [],
            assets: [],
            netWorth: 3000,
            physicalHealth: 60,
            mentalHealth: 50,
            statusEffects: [],
            actionHistory: [],
          }),
        ],
      }),
    ])
  })

  it('preserves valid saved state while enforcing health and net-worth invariants', () => {
    window.localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'stateful-game',
          version: 7,
          players: [
            {
              id: 'player-9',
              name: 'Jo',
              cityId: 'metro',
              jobId: 'registered-nurse',
              cash: 1000,
              assets: [{ currentValue: 5000 }],
              debts: [{ balance: 2000 }],
              netWorth: 999999,
              physicalHealth: 105,
              mentalHealth: -1,
            },
          ],
        },
      ]),
    )

    expect(readStoredGamesSnapshot()[0]).toMatchObject({
      version: 7,
      players: [
        expect.objectContaining({
          cash: 1000,
          netWorth: 4000,
          physicalHealth: 100,
          mentalHealth: 0,
        }),
      ],
    })
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

  it('advances local turns with a deterministic fallback event and applies the effect only once', async () => {
    window.localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'local-game',
          version: 2,
          turnNumber: 1,
          activePlayerIndex: 0,
          players: [
            { id: 'player-1', name: 'Ari', cash: 1000, physicalHealth: 60, mentalHealth: 50 },
            { id: 'player-2', name: 'Jo', cash: 1000, physicalHealth: 60, mentalHealth: 50 },
          ],
          moveHistory: [],
          events: [],
        },
      ]),
    )
    const storage = createGameStorage()
    const request = { actionType: 'pass', expectedVersion: 2 }

    const first = await storage.advanceTurn('local-game', request)
    const second = await storage.advanceTurn('local-game', request)

    expect(first.event).toMatchObject({
      turnKey: 'local-game:v2',
      playerId: 'player-1',
      generationMode: 'fallback',
      source: expect.objectContaining({ publisher: 'Modern Game of Life' }),
    })
    expect(first.game.events).toHaveLength(1)
    expect(first.game.moveHistory[0].eventId).toBe(first.event.id)
    expect(second).toMatchObject({ idempotent: true, event: { id: first.event.id } })
    expect(second.game).toEqual(first.game)
  })

  it('uses the turn advancement endpoint in API mode', async () => {
    vi.stubEnv('VITE_STORAGE_MODE', 'api')
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
    const game = {
      id: 'cloud-game',
      version: 4,
      players: [{ id: 'player-1', name: 'Ari' }],
      turnNumber: 2,
      activePlayerIndex: 0,
      moveHistory: [],
      events: [],
    }
    const event = {
      id: 'event-1',
      turnKey: 'cloud-game:v3',
      playerId: 'player-1',
      turnNumber: 1,
      title: 'A saved event',
      narrative: 'The event was saved with the turn.',
      outcome: 'positive',
      effect: { metric: 'mentalHealth', amount: 2 },
      source: { publisher: 'NOAA', headline: 'Coastal news', publishedAt: null },
      generationMode: 'bedrock',
      createdAt: 123,
    }
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ game, event }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await createGameStorage().advanceTurn('cloud-game', {
      actionType: 'choose_action',
      expectedVersion: 3,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/games/cloud-game/turns/advance',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ actionType: 'choose_action', expectedVersion: 3 }),
      }),
    )
    expect(result.event).toMatchObject({ id: 'event-1', generationMode: 'bedrock' })
  })
})
