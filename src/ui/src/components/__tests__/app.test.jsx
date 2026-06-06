import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
    await user.click(screen.getByRole('button', { name: /Denver/i }))
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
    await user.click(screen.getByRole('button', { name: /New York City/i }))
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
          moveHistory: [],
        }),
      }),
    )

    expect(window.life.status().persistedGame.players).toHaveLength(2)
    expect(window.life.status().persistedGame.players).toEqual([
      expect.objectContaining({
        id: 'player-1',
        name: 'Ted',
        cityId: 'suburbia',
        jobId: 'content-creator',
        careerId: 'content-creator',
        cash: 5000,
        debts: [],
        assets: [],
        netWorth: 5000,
        physicalHealth: 75,
        mentalHealth: 74,
        statusEffects: [],
        actionHistory: [],
      }),
      expect.objectContaining({
        id: 'player-2',
        name: 'Mia',
        cityId: 'metro',
        jobId: 'software-engineer',
        careerId: 'software-engineer',
        cash: 8000,
        debts: [expect.objectContaining({ balance: 30000, type: 'student-loan' })],
        assets: [],
        netWorth: -22000,
        physicalHealth: 74,
        mentalHealth: 73,
        statusEffects: [],
        actionHistory: [],
      }),
    ])
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
    const actionDialog = screen.getByRole('dialog')
    expect(within(actionDialog).getByText("Ted's Turn 1")).toBeInTheDocument()
    const chooseActionConfirm = within(actionDialog).getByRole('button', { name: 'Choose Action' })
    expect(chooseActionConfirm).toBeDisabled()
    await user.click(within(actionDialog).getByRole('button', { name: /Join Gym/i }))
    expect(chooseActionConfirm).toBeEnabled()
    await user.click(chooseActionConfirm)

    await waitFor(() =>
      expect(window.life.status()).toMatchObject({
        playScreen: 'turn',
        turnNumber: 1,
        activePlayerIndex: 1,
        isHistoryOpen: false,
        persistedGame: expect.objectContaining({
          turnNumber: 1,
          activePlayerIndex: 1,
          moveHistory: [
            expect.objectContaining({
              playerId: 'player-1',
              playerName: 'Ted',
              turnNumber: 1,
              actionType: 'choose_action',
              actionId: 'join-gym',
              actionLabel: 'Join Gym',
            }),
          ],
        }),
      }),
    )

    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 1' })).toBeInTheDocument()
    expect(screen.getByText("Mia's Turn")).toBeInTheDocument()
    expect(window.life.status().persistedGame.moveHistory).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'See History' }))

    expect(screen.getByText("Mia's Actions")).toBeInTheDocument()
    expect(screen.getByText('No moves have been recorded for this player yet.')).toBeInTheDocument()
    expect(window.life.status()).toMatchObject({
      isHistoryOpen: true,
      historyPlayerId: 'player-2',
    })

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText("Mia's Actions")).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Pass' }))

    await waitFor(() =>
      expect(window.life.status()).toMatchObject({
        playScreen: 'turn',
        turnNumber: 2,
        activePlayerIndex: 0,
        persistedGame: expect.objectContaining({
          turnNumber: 2,
          activePlayerIndex: 0,
          moveHistory: [
            expect.objectContaining({
              actionType: 'choose_action',
              playerId: 'player-1',
            }),
            expect.objectContaining({
              actionType: 'pass',
              playerId: 'player-2',
              playerName: 'Mia',
              turnNumber: 1,
              actionLabel: 'Pass',
              turnResolution: expect.objectContaining({
                preTurnSnapshot: expect.objectContaining({ cash: 8000, netWorth: -22000 }),
                postTurnSnapshot: expect.objectContaining({ cash: 11975, netWorth: -17875 }),
              }),
            }),
          ],
          players: [
            expect.objectContaining({ id: 'player-1', cash: 5000, netWorth: 5000 }),
            expect.objectContaining({
              id: 'player-2',
              cash: 11975,
              debts: [expect.objectContaining({ balance: 29850 })],
              netWorth: -17875,
              physicalHealth: 73,
              mentalHealth: 71,
              actionHistory: [expect.objectContaining({ actionType: 'pass', turnNumber: 1 })],
            }),
          ],
        }),
      }),
    )

    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 2' })).toBeInTheDocument()
    expect(screen.getByText("Ted's Turn")).toBeInTheDocument()
    expect(window.life.status().persistedGame.moveHistory).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'See History' }))
    const historyDialog = screen.getByRole('dialog')
    expect(within(historyDialog).getByText("Ted's Actions")).toBeInTheDocument()
    expect(within(historyDialog).getByText('Join Gym')).toBeInTheDocument()
    expect(within(historyDialog).queryByText('Pass')).not.toBeInTheDocument()
  })

  it('reports resumed game state from window.life.status()', async () => {
    const user = userEvent.setup()
    const resumedGame = {
      id: 'resume-route',
      name: 'Resume Ready',
      status: 'active',
      turnNumber: 3,
      activePlayerIndex: 1,
      moveHistory: [],
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
    const actionDialog = screen.getByRole('dialog')
    expect(within(actionDialog).getByText("Jo's Turn 3")).toBeInTheDocument()
    await user.click(within(actionDialog).getByRole('button', { name: /Side Gig/i }))
    await user.click(within(actionDialog).getByRole('button', { name: 'Choose Action' }))

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
          moveHistory: [
            expect.objectContaining({
              playerId: 'player-2',
              playerName: 'Jo',
              turnNumber: 3,
              actionType: 'choose_action',
              actionId: 'side-gig',
              actionLabel: 'Side Gig',
            }),
          ],
        }),
      }),
    )

    expect(JSON.stringify(window.life.status().persistedGame)).not.toBe(persistedBefore)
    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 4' })).toBeInTheDocument()
    expect(screen.getByText("Ari's Turn")).toBeInTheDocument()
  })

  it('does not advance the turn when action selection is canceled or dismissed', async () => {
    const user = userEvent.setup()
    const activeGame = {
      id: 'cancel-action-game',
      name: 'Cancel Action',
      status: 'active',
      turnNumber: 2,
      activePlayerIndex: 0,
      moveHistory: [],
      players: [
        { id: 'player-1', name: 'Ari', avatar: 'fox' },
        { id: 'player-2', name: 'Jo', avatar: 'bear' },
      ],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      resumable: true,
    }

    mockUseGamesState.games = [activeGame]
    mockUseGamesState.updateGame.mockImplementation(async (gameId, updates) => ({
      ...updates,
      id: gameId,
    }))

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Resume' }))
    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))

    await user.click(screen.getByRole('button', { name: 'Choose Action' }))
    expect(screen.getByText("Ari's Turn 2")).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText("Ari's Turn 2")).not.toBeInTheDocument()
    expect(mockUseGamesState.updateGame).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 2' })).toBeInTheDocument()
    expect(screen.getByText("Ari's Turn")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Choose Action' }))
    expect(screen.getByText("Ari's Turn 2")).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByText("Ari's Turn 2")).not.toBeInTheDocument()
    expect(mockUseGamesState.updateGame).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 2' })).toBeInTheDocument()
    expect(screen.getByText("Ari's Turn")).toBeInTheDocument()
  })

  it('normalizes missing move history for older saved games', async () => {
    const user = userEvent.setup()
    const olderGame = {
      id: 'older-game',
      name: 'Older Save',
      status: 'active',
      turnNumber: 2,
      activePlayerIndex: 0,
      players: [
        { id: 'player-1', name: 'Ari', avatar: 'fox' },
        { id: 'player-2', name: 'Jo', avatar: 'bear' },
      ],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      resumable: true,
    }

    mockUseGamesState.games = [olderGame]
    mockUseGamesState.updateGame.mockImplementation(async (gameId, updates) => {
      const updatedGame = {
        ...updates,
        id: gameId,
      }
      mockUseGamesState.games = [updatedGame]
      window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([updatedGame]))
      return updatedGame
    })
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([olderGame]))

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Resume' }))
    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))

    expect(window.life.status().persistedGame.moveHistory).toEqual([])

    await user.click(screen.getByRole('button', { name: 'Pass' }))

    await waitFor(() =>
      expect(window.life.status().persistedGame.moveHistory).toEqual([
        expect.objectContaining({
          playerId: 'player-1',
          actionType: 'pass',
          actionLabel: 'Pass',
          turnNumber: 2,
        }),
      ]),
    )
  })
})
