import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, afterEach, vi } from 'vitest'
import App from '../../App'
import { GAME_STORAGE_KEY, normalizeGame } from '../../services/gameStorage'
import { advanceLocalGameTurn } from '../../services/turnEvents'

const mockUseGamesState = {
  games: [],
  isLoading: false,
  fetchError: '',
  loadGames: vi.fn(),
  createGame: vi.fn(),
  deleteGame: vi.fn(),
  updateGame: vi.fn(),
  advanceTurn: vi.fn(),
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
      advanceTurn: vi.fn(async (gameId, request) => {
        const existing = normalizeGame(mockUseGamesState.games.find((game) => game.id === String(gameId)))
        const result = advanceLocalGameTurn(existing, request, 123456)
        mockUseGamesState.games = mockUseGamesState.games.map((game) =>
          game.id === result.game.id ? result.game : game,
        )
        window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(mockUseGamesState.games))
        return result
      }),
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
          moveHistory: [],
        }),
      }),
    )

    expect(window.life.status().persistedGame.players).toHaveLength(2)
    expect(window.life.status().persistedGame).toMatchObject({
      version: 1,
      players: [
        expect.objectContaining({
          name: 'Ted',
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
        expect.objectContaining({
          name: 'Mia',
          cityId: 'metro',
          careerId: 'software-engineer',
          cash: 4000,
          netWorth: -26000,
          physicalHealth: 50,
          mentalHealth: 39,
        }),
      ],
    })
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
        isHistoryOpen: false,
        persistedGame: expect.objectContaining({
          version: 2,
          turnNumber: 1,
          activePlayerIndex: 1,
          moveHistory: [
            expect.objectContaining({
              playerId: 'player-1',
              playerName: 'Ted',
              turnNumber: 1,
              actionType: 'choose_action',
              actionLabel: 'Choose Action',
            }),
          ],
        }),
      }),
    )

    const firstEventDialog = screen.getByRole('dialog')
    expect(within(firstEventDialog).getByText('Your Life Event')).toBeInTheDocument()
    expect(within(firstEventDialog).getByRole('status')).toHaveTextContent(/outcome/i)
    expect(within(firstEventDialog).getByText(/Source checked: Modern Game of Life/)).toBeInTheDocument()
    expect(within(firstEventDialog).getByText('Offline family-safe event')).toBeInTheDocument()
    expect(within(firstEventDialog).getByText(/reviewed backup event was used/i)).toBeInTheDocument()
    expect(screen.getByText("Ted's Turn")).toBeInTheDocument()
    expect(screen.queryByText("Mia's Turn")).not.toBeInTheDocument()
    expect(document.activeElement).toBe(within(firstEventDialog).getByRole('button', { name: 'Continue' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(window.life.status().persistedGame.moveHistory).toHaveLength(1)

    await user.click(within(firstEventDialog).getByRole('button', { name: 'Continue' }))
    expect(screen.getByText("Mia's Turn")).toBeInTheDocument()

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
          version: 3,
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
            }),
          ],
        }),
      }),
    )

    expect(screen.getByText("Mia's Turn")).toBeInTheDocument()
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 2' })).toBeInTheDocument()
    expect(screen.getByText("Ted's Turn")).toBeInTheDocument()
    expect(window.life.status().persistedGame.moveHistory).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'See History' }))
    const historyDialog = screen.getByRole('dialog')
    expect(within(historyDialog).getByText("Ted's Actions")).toBeInTheDocument()
    expect(within(historyDialog).getByText('Choose Action')).toBeInTheDocument()
    expect(within(historyDialog).getByText(/Offline family-safe event/)).toBeInTheDocument()
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
          moveHistory: [
            expect.objectContaining({
              playerId: 'player-2',
              playerName: 'Jo',
              turnNumber: 3,
              actionType: 'choose_action',
            }),
          ],
        }),
      }),
    )

    expect(JSON.stringify(window.life.status().persistedGame)).not.toBe(persistedBefore)
    expect(screen.getByText("Jo's Turn")).toBeInTheDocument()
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 4' })).toBeInTheDocument()
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

  it('disables every turn control and announces loading while an event resolves', async () => {
    const user = userEvent.setup()
    let resolveAdvance
    mockUseGamesState.games = [normalizeGame({
      id: 'loading-game',
      name: 'Loading Game',
      version: 1,
      turnNumber: 1,
      activePlayerIndex: 0,
      moveHistory: [],
      events: [],
      players: [
        { id: 'player-1', name: 'Ari', avatar: 'fox' },
        { id: 'player-2', name: 'Jo', avatar: 'bear' },
      ],
      resumable: true,
    })]
    mockUseGamesState.advanceTurn = vi.fn(() => new Promise((resolve) => { resolveAdvance = resolve }))

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Resume' }))
    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))
    await user.click(screen.getByRole('button', { name: 'Choose Action' }))

    expect(screen.getByRole('status')).toHaveTextContent('Creating your life event')
    for (const name of ['Previous player', 'Next player', 'See History', 'Advancing...', 'Pass']) {
      expect(screen.getByRole('button', { name })).toBeDisabled()
    }

    const result = advanceLocalGameTurn(mockUseGamesState.games[0], {
      actionType: 'choose_action',
      expectedVersion: 1,
    }, 123456)
    resolveAdvance(result)
    await screen.findByRole('dialog')
  })

  it('shows a persisted event in player history after resuming a game', async () => {
    const user = userEvent.setup()
    mockUseGamesState.games = [normalizeGame({
      id: 'history-game',
      name: 'History Game',
      version: 2,
      turnNumber: 2,
      activePlayerIndex: 0,
      players: [
        { id: 'player-1', name: 'Ari', avatar: 'fox' },
        { id: 'player-2', name: 'Jo', avatar: 'bear' },
      ],
      moveHistory: [{
        id: 'move-1',
        playerId: 'player-1',
        playerName: 'Ari',
        turnNumber: 1,
        actionType: 'choose_action',
        actionLabel: 'Choose Action',
        eventId: 'event-1',
        createdAt: 123456,
      }],
      events: [{
        id: 'event-1',
        turnKey: 'history-game:v1',
        playerId: 'player-1',
        turnNumber: 1,
        title: 'A community garden grows',
        narrative: 'Neighbors share fresh produce and helpful ideas.',
        outcome: 'positive',
        effect: { metric: 'mentalHealth', amount: 2 },
        source: { publisher: 'NOAA', headline: 'Volunteers restore a local habitat', publishedAt: null },
        generationMode: 'bedrock',
        createdAt: 123456,
      }],
      resumable: true,
    })]

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Resume' }))
    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))
    await user.click(screen.getByRole('button', { name: 'See History' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('A community garden grows')).toBeInTheDocument()
    expect(within(dialog).getByText('Neighbors share fresh produce and helpful ideas.')).toBeInTheDocument()
    expect(within(dialog).getByText('Inspired by: NOAA: Volunteers restore a local habitat')).toBeInTheDocument()
  })
})
