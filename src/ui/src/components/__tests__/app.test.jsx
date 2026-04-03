import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import App from '../../App'
import { GAME_STORAGE_KEY } from '../../services/gameStorage'
import { createGame } from '../../test/testUtils'
import { normalizeGameState } from '../../utils/turnEngine'

const mockUseGamesState = {
  games: [],
  isLoading: false,
  fetchError: '',
  loadGames: vi.fn(),
  getGame: vi.fn(),
  createGame: vi.fn(),
  deleteGame: vi.fn(),
  updateGame: vi.fn(),
  advanceTurn: vi.fn(),
  beginNextTurn: vi.fn(),
  newGameId: null,
  setNewGameId: vi.fn(),
}

vi.mock('../../hooks/useGames', () => ({
  default: () => mockUseGamesState,
}))

describe('App flows', () => {
  beforeEach(() => {
    const now = Date.now()
    const baseGame = createGame({
      id: 'resume-route',
      name: 'Resume Ready',
      status: 'turn_ready',
      lastUpdated: now,
      createdAt: now,
      availableActions: [
        {
          id: 'side-gig',
          label: 'Side Gig',
          description: 'Extra income now with some health tradeoff.',
          preview: {
            cash: [350, 550],
            netWorth: [350, 550],
            physicalHealth: [-2, -1],
            mentalHealth: [-2, -1],
            riskNotes: ['Can relieve cash pressure but increases fatigue.'],
          },
        },
      ],
    })
    Object.assign(mockUseGamesState, {
      games: [],
      isLoading: false,
      fetchError: '',
      loadGames: vi.fn(),
      getGame: vi.fn(async (gameId) => ({ ...baseGame, id: gameId })),
      createGame: vi.fn(async (game) => ({ ...game, id: 'created-game' })),
      deleteGame: vi.fn(),
      updateGame: vi.fn(async (gameId, updates) => ({ ...updates, id: gameId })),
      advanceTurn: vi.fn(async () => ({
        game: createGame({
          ...baseGame,
          status: 'handoff',
          activePlayerIndex: 0,
          pendingHandoff: {
            fromPlayerId: 'player-1',
            toPlayerId: 'player-1',
            toPlayerName: 'Ari',
            month: 1,
            readyAt: now,
          },
        }),
        turnResolution: {
          summary: {
            headline: 'Ari finished month 1 with Side Gig.',
            keyChanges: [{ metric: 'cash', delta: 400 }],
            intendedOutcomes: [{ source: 'Side Gig', description: 'The side gig brought in cash.' }],
            unintendedOutcomes: [{ source: 'Minor Illness', description: 'A minor illness cost money.' }],
            eventLabel: 'Minor Illness',
          },
        },
      })),
      beginNextTurn: vi.fn(async (gameId, game) => ({ ...game, id: gameId, status: 'turn_ready', pendingHandoff: null })),
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

    render(<App />)

    expect(window.life.status()).toMatchObject({
      view: 'home',
      entrySource: 'none',
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
        playStage: 'welcome',
        activeGameId: 'created-game',
      }),
    )

    expect(window.life.status().activeGame.players).toHaveLength(2)
  })

  it('reports resumed game state from window.life.status()', async () => {
    const user = userEvent.setup()
    const resumedGame = createGame({ id: 'resume-route', name: 'Resume Ready' })

    mockUseGamesState.games = [resumedGame]
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([resumedGame]))

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Resume' }))

    await waitFor(() =>
      expect(window.life.status()).toMatchObject({
        view: 'play',
        entrySource: 'resume',
        playStage: 'turn',
        activeGameId: 'resume-route',
      }),
    )
  })

  it('moves from Welcome into the active player turn when starting a new game', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'New Game' }))
    await user.clear(screen.getByRole('textbox', { name: 'Game name' }))
    await user.type(screen.getByRole('textbox', { name: 'Game name' }), 'Turn Start Check')
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

    await screen.findByRole('heading', { name: 'Welcome to Life!' })
    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))

    await screen.findByRole('heading', { name: /Ted's Turn/i })
    expect(window.life.status()).toMatchObject({
      view: 'play',
      playStage: 'turn',
      entrySource: 'create',
    })
  })

  it('allows legacy active games to resume into a valid turn state', async () => {
    const user = userEvent.setup()
    const resumedGame = createGame({ id: 'legacy-active', name: 'Legacy Active', status: 'active' })

    mockUseGamesState.games = [resumedGame]
    mockUseGamesState.getGame = vi.fn(async () => normalizeGameState(resumedGame))

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Resume' }))

    await screen.findByRole('heading', { name: /Ari's Turn/i })
    expect(window.life.status()).toMatchObject({
      view: 'play',
      playStage: 'turn',
      activeGame: expect.objectContaining({
        status: 'turn_ready',
      }),
    })
  })
})
