import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGameStorage, GAME_STORAGE_KEY } from '../gameStorage'

describe('gameStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.unstubAllEnvs()
  })

  it('updates stored games with richer turn-state payloads in local mode', async () => {
    vi.stubEnv('VITE_STORAGE_MODE', 'local')
    const storage = createGameStorage()

    const created = await storage.createGame({
      id: 'game-1',
      name: 'Family Night',
      status: 'active',
      players: [{ id: 'player-1', name: 'Ari', cash: 4200 }],
      createdAt: 1,
      lastUpdated: 1,
      resumable: true,
    })

    const updated = await storage.updateGame(created.id, {
      activePlayerIndex: 1,
      turnNumber: 4,
      phase: 'pass-control',
      turnHistory: [{ turnNumber: 3, action: { id: 'side-gig' } }],
      players: [{ id: 'player-1', name: 'Ari', cash: 4600, debt: 1200 }],
      lastUpdated: 2,
    })

    const stored = JSON.parse(window.localStorage.getItem(GAME_STORAGE_KEY))

    expect(updated.turnNumber).toBe(4)
    expect(updated.phase).toBe('pass-control')
    expect(updated.players[0].cash).toBe(4600)
    expect(stored[0].turnHistory).toHaveLength(1)
  })
})
