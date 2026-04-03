import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, afterEach, vi } from 'vitest'
import App from '../../App'
import { GAME_STORAGE_KEY } from '../../services/gameStorage'

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

describe('App create flow', () => {
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
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete window.life
  })

  it('keeps the new game wizard open until the user explicitly closes it', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'New Game' }))

    expect(screen.getByRole('heading', { name: 'Name Your Game' })).toBeInTheDocument()

    await user.click(screen.getByRole('dialog'))
    expect(screen.getByRole('heading', { name: 'Name Your Game' })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByRole('heading', { name: 'Name Your Game' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('heading', { name: 'Name Your Game' })).not.toBeInTheDocument()
  })

  it('exposes window.life.status() for home, create, and created game states', async () => {
    const user = userEvent.setup()
    mockUseGamesState.createGame.mockImplementation(async (game) => {
      const createdGame = {
        ...game,
        id: 'created-game',
      }
      mockUseGamesState.games = [createdGame]
      window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([createdGame]))
      return createdGame
    })
    mockUseGamesState.updateGame.mockImplementation(async (gameId, updates) => {
      const updatedGame = {
        ...updates,
        id: gameId,
      }
      mockUseGamesState.games = [updatedGame]
      window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([updatedGame]))
      return updatedGame
    })

    render(<App />)

    expect(window.life.status()).toMatchObject({
      view: 'home',
      entrySource: 'none',
      playScreen: 'welcome',
      activeGameId: null,
      activeGame: null,
      persistedGame: null,
    })

    await user.click(screen.getByRole('button', { name: 'New Game' }))

    expect(window.life.status()).toMatchObject({
      view: 'create',
      entrySource: 'none',
      wizardDraft: expect.objectContaining({
        gameName: 'Family Game Night',
        currentStep: 1,
      }),
    })

    await user.clear(screen.getByRole('textbox', { name: 'Game name' }))
    await user.type(screen.getByRole('textbox', { name: 'Game name' }), 'Console Check')
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.clear(screen.getByRole('textbox', { name: 'Nickname' }))
    await user.type(screen.getByRole('textbox', { name: 'Nickname' }), 'Ted')
    await user.click(screen.getByRole('button', { name: 'Fox' }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.click(screen.getByRole('button', { name: /Suburbia/i }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.click(screen.getByRole('button', { name: /Self-Taught/i }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.click(screen.getByRole('button', { name: /Content Creator/i }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.click(screen.getByRole('button', { name: /Add Player/i }))
    await user.clear(screen.getByRole('textbox', { name: 'Nickname' }))
    await user.type(screen.getByRole('textbox', { name: 'Nickname' }), 'Mia')
    await user.click(screen.getByRole('button', { name: 'Bear' }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.click(screen.getByRole('button', { name: /Metro/i }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.click(screen.getByRole('button', { name: /Degree/i }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.click(screen.getByRole('button', { name: /Software Engineer/i }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.click(screen.getByRole('button', { name: /Start Game/i }))

    await waitFor(() =>
      expect(window.life.status()).toMatchObject({
        view: 'play',
        entrySource: 'create',
        playScreen: 'welcome',
        activeGameId: 'created-game',
        turnNumber: 1,
        activePlayerIndex: 0,
        persistedGame: expect.objectContaining({
          id: 'created-game',
          name: 'Console Check',
        }),
      }),
    )

    expect(window.life.status().persistedGame.players).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Welcome to Life!' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))

    await waitFor(() =>
      expect(window.life.status()).toMatchObject({
        view: 'play',
        playScreen: 'turn',
        activeGameId: 'created-game',
        turnNumber: 1,
        activePlayerIndex: 0,
      }),
    )

    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 1' })).toBeInTheDocument()
    expect(screen.getByText("Ted's Turn")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Choose Action' }))

    await waitFor(() =>
      expect(window.life.status()).toMatchObject({
        playScreen: 'turn',
        turnNumber: 1,
        activePlayerIndex: 1,
        persistedGame: expect.objectContaining({
          turnNumber: 1,
          activePlayerIndex: 1,
        }),
      }),
    )

    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 1' })).toBeInTheDocument()
    expect(screen.getByText("Mia's Turn")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Choose Action' }))

    await waitFor(() =>
      expect(window.life.status()).toMatchObject({
        playScreen: 'turn',
        turnNumber: 2,
        activePlayerIndex: 0,
        persistedGame: expect.objectContaining({
          turnNumber: 2,
          activePlayerIndex: 0,
        }),
      }),
    )

    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 2' })).toBeInTheDocument()
    expect(screen.getByText("Ted's Turn")).toBeInTheDocument()
  })

  it('reports resumed game state from window.life.status()', async () => {
    const user = userEvent.setup()
    const resumedGame = {
      id: 'resume-route',
      name: 'Resume Ready',
      status: 'active',
      turnNumber: 3,
      activePlayerIndex: 1,
      players: [
        { id: 'player-1', name: 'Ari', avatar: 'fox' },
        { id: 'player-2', name: 'Jo', avatar: 'bear' },
      ],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      resumable: true,
    }

    mockUseGamesState.games = [resumedGame]
    mockUseGamesState.updateGame.mockImplementation(async (gameId, updates) => {
      const updatedGame = {
        ...updates,
        id: gameId,
      }
      mockUseGamesState.games = [updatedGame]
      window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([updatedGame]))
      return updatedGame
    })
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([resumedGame]))

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Resume' }))

    expect(window.life.status()).toMatchObject({
      view: 'play',
      entrySource: 'resume',
      playScreen: 'welcome',
      activeGameId: 'resume-route',
      turnNumber: 3,
      activePlayerIndex: 1,
      persistedGame: expect.objectContaining({
        id: 'resume-route',
        name: 'Resume Ready',
      }),
    })

    const persistedBefore = JSON.stringify(window.life.status().persistedGame)
    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))
    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 3' })).toBeInTheDocument()
    expect(screen.getByText("Jo's Turn")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Choose Action' }))

    await waitFor(() =>
      expect(window.life.status()).toMatchObject({
        view: 'play',
        entrySource: 'resume',
        playScreen: 'turn',
        activeGameId: 'resume-route',
        turnNumber: 4,
        activePlayerIndex: 0,
        persistedGame: expect.objectContaining({
          turnNumber: 4,
          activePlayerIndex: 0,
        }),
      }),
    )

    expect(JSON.stringify(window.life.status().persistedGame)).not.toBe(persistedBefore)
    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 4' })).toBeInTheDocument()
    expect(screen.getByText("Ari's Turn")).toBeInTheDocument()
  })
})
