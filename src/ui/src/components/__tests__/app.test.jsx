import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import App from '../../App'
import { GAME_STORAGE_KEY } from '../../services/gameStorage'
import { initializeGameForPlay } from '../../services/gameplay'

const mockUseGamesState = {
  games: [],
  isLoading: false,
  fetchError: '',
  loadGames: vi.fn(),
  createGame: vi.fn(),
  deleteGame: vi.fn(),
  updateGame: vi.fn(),
  newGameId: null,
  setNewGameId: vi.fn(),
}

vi.mock('../../hooks/useGames', () => ({
  default: () => mockUseGamesState,
}))

describe('App play flow', () => {
  beforeEach(() => {
    Object.assign(mockUseGamesState, {
      games: [],
      isLoading: false,
      fetchError: '',
      loadGames: vi.fn(),
      createGame: vi.fn(),
      deleteGame: vi.fn(),
      updateGame: vi.fn(),
      newGameId: null,
      setNewGameId: vi.fn(),
    })
    window.localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete window.life
  })

  it('exposes home status through window.life.status()', () => {
    render(<App />)

    expect(window.life.status()).toMatchObject({
      view: 'home',
      entrySource: 'none',
      activeGameId: null,
    })
  })

  it('resumes a saved game through welcome, summary, and next turn', async () => {
    const user = userEvent.setup()
    const resumedGame = initializeGameForPlay({
      id: 'turn-flow',
      name: 'Turn Flow',
      status: 'active',
      players: [
        {
          id: 'player-1',
          name: 'Ari',
          avatar: 'fox',
          cityId: 'suburbia',
          educationTrackId: 'degree',
          jobId: 'software-engineer',
        },
        {
          id: 'player-2',
          name: 'Jo',
          avatar: 'bear',
          cityId: 'small-town',
          educationTrackId: 'trades',
          jobId: 'electrician',
        },
      ],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      resumable: true,
    })

    mockUseGamesState.games = [resumedGame]
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([resumedGame]))
    mockUseGamesState.updateGame.mockImplementation(async (gameId, game) => {
      const updatedGame = { ...game, id: gameId }
      mockUseGamesState.games = [updatedGame]
      window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([updatedGame]))
      return updatedGame
    })

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Resume' }))

    expect(window.life.status()).toMatchObject({
      view: 'play',
      entrySource: 'resume',
      activeGame: expect.objectContaining({
        playState: expect.objectContaining({
          view: 'welcome',
        }),
      }),
    })

    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))
    await screen.findByRole('heading', { name: /Ari's turn/i })

    await user.click(screen.getByRole('button', { name: /Choose Debt Paydown/i }))
    await screen.findByRole('heading', { name: /Ari finished Month 1/i })

    expect(window.life.status()).toMatchObject({
      activeGame: expect.objectContaining({
        playState: expect.objectContaining({
          view: 'summary',
          activePlayerIndex: 1,
          turnNumber: 2,
        }),
      }),
    })

    await user.click(screen.getByRole('button', { name: /Continue to Jo/i }))

    await waitFor(() =>
      expect(window.life.status()).toMatchObject({
        activeGame: expect.objectContaining({
          playState: expect.objectContaining({
            view: 'turn',
            activePlayerIndex: 1,
            turnNumber: 2,
          }),
        }),
      }),
    )
  })
})
