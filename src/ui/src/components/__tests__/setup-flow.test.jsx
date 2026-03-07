import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, renderHook, act, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import useCreateGameForm from '../../hooks/useCreateGameForm'
import useGames from '../../hooks/useGames'

const storageState = vi.hoisted(() => {
  const games = [
    {
      id: 'seed-1',
      name: 'Choices Matter',
      status: 'active',
      players: [],
      lastUpdated: 1,
      createdAt: 1,
      resumable: true,
    },
  ]

  const storage = {
    listGames: vi.fn(async () => games.slice()),
    createGame: vi.fn(async (game) => {
      const created = { ...game, id: game.id || `saved-${games.length + 1}` }
      games.unshift(created)
      return created
    }),
    updateGame: vi.fn(async (gameId, updates) => {
      const normalizedId = String(gameId)
      const index = games.findIndex((game) => game.id === normalizedId)
      if (index === -1) {
        throw new Error('missing game')
      }
      const merged = { ...games[index], ...updates, id: normalizedId }
      games[index] = merged
      return merged
    }),
    deleteGame: vi.fn(async (gameId) => {
      const index = games.findIndex((game) => game.id === String(gameId))
      if (index !== -1) {
        games.splice(index, 1)
      }
    }),
  }

  return { storage }
})

vi.mock('../../services/gameStorage', () => ({
  createGameStorage: () => storageState.storage,
  normalizeGameRecord: (game) => game,
}))

describe('Wave 1 setup draft and persistence contract', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('stores player setup fields and enforces unique names in the draft', () => {
    const { result } = renderHook(() => useCreateGameForm())

    expect(result.current.currentStep).toBe(1)
    expect(result.current.minPlayers).toBe(2)

    act(() => {
      result.current.updateDraftName('Alex')
    })

    act(() => {
      result.current.addPlayer()
    })

    expect(result.current.players).toEqual([
      expect.objectContaining({
        id: '1',
        name: 'Alex',
        cityId: '',
        educationTrackId: '',
        jobId: '',
        careerTrack: '',
      }),
    ])

    act(() => {
      result.current.updateDraftName('alex')
      result.current.markDraftTouched('name')
    })

    expect(result.current.draftErrors.name).toBe('Names must be unique.')
    expect(result.current.arePlayersValid).toBe(false)
  })

  it('does not persist new games until the final update/start call', async () => {
    const { result } = renderHook(() => useGames())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const draftGame = await act(async () => {
      return result.current.createGame({
        name: 'Draft Setup',
        status: 'active',
        players: [
          {
            id: '1',
            name: 'Alex',
            avatar: 'fox',
            cityId: 'seattle-wa',
            educationTrackId: 'degree-track',
            jobId: 'software-engineer',
            careerTrack: 'Degree Track',
          },
          {
            id: '2',
            name: 'Sam',
            avatar: 'bear',
            cityId: 'austin-tx',
            educationTrackId: 'trades-track',
            jobId: 'electrician',
            careerTrack: 'Trades Track',
          },
        ],
        lastUpdated: 100,
        createdAt: 100,
        resumable: true,
      })
    })

    expect(draftGame.__draft).toBe(true)
    expect(storageState.storage.createGame).toHaveBeenCalledTimes(0)

    await act(async () => {
      await result.current.updateGame(draftGame.id, {
        ...draftGame,
        __draft: true,
        name: 'Final Family Night',
        lastUpdated: 200,
      })
    })

    expect(storageState.storage.createGame).toHaveBeenCalledTimes(1)
    expect(storageState.storage.updateGame).toHaveBeenCalledTimes(0)
    expect(result.current.games[0]).toEqual(
      expect.objectContaining({
        name: 'Final Family Night',
        players: [
          expect.objectContaining({ id: '1', cityId: 'seattle-wa', educationTrackId: 'degree-track' }),
          expect.objectContaining({ id: '2', cityId: 'austin-tx', educationTrackId: 'trades-track' }),
        ],
      }),
    )
  })

  it('routes the next committed player through setup before showing summary', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'New Game' }))
    await user.type(screen.getByRole('textbox', { name: 'Game Name:' }), 'Family Night')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.type(screen.getByRole('textbox', { name: 'Player Name:' }), 'Alex')
    await user.click(screen.getByRole('button', { name: '+ Add Player' }))
    await user.type(screen.getByRole('textbox', { name: 'Player Name:' }), 'Sam')
    await user.click(screen.getByRole('button', { name: '+ Add Player' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.click(screen.getByRole('radio', { name: 'San Francisco, CA' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('radio', { name: 'Degree Track' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('radio', { name: 'Software Engineer' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.queryByRole('heading', { name: 'New Game - Summary' })).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Austin, TX' })).toBeInTheDocument()
  })
})
