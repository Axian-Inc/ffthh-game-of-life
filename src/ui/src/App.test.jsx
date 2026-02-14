import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import useGames from './hooks/useGames'
import useModalState from './hooks/useModalState'
import useCreateGameForm from './hooks/useCreateGameForm'

vi.mock('./hooks/useGames', () => ({
  default: vi.fn(),
}))
vi.mock('./hooks/useModalState', () => ({
  default: vi.fn(),
}))
vi.mock('./hooks/useCreateGameForm', () => ({
  default: vi.fn(),
}))

const baseModalState = {
  state: {
    view: 'home',
    activeGame: null,
    activeGameMode: 'resume',
    pendingDelete: null,
  },
  openCreate: vi.fn(),
  openSession: vi.fn(),
  openDelete: vi.fn(),
  openStart: vi.fn(),
  closeAll: vi.fn(),
}

const baseCreateForm = {
  gameName: '',
  setGameName: vi.fn(),
  gameNameTouched: false,
  setGameNameTouched: vi.fn(),
  gameType: 'classic',
  setGameType: vi.fn(),
  scoringMode: 'standard',
  setScoringMode: vi.fn(),
  players: [],
  draftPlayer: { name: '', avatar: 'A' },
  draftTouched: { name: false },
  draftErrors: { name: '' },
  maxGameNameLength: 60,
  maxPlayerNameLength: 24,
  minPlayers: 1,
  trimmedGameName: '',
  isGameNameTooLong: false,
  isGameNameValid: false,
  arePlayersValid: false,
  resetForm: vi.fn(),
  markAllTouched: vi.fn(),
  addPlayer: vi.fn(),
  removePlayer: vi.fn(),
  updateDraftName: vi.fn(),
  markDraftTouched: vi.fn(),
  randomizeDraftAvatar: vi.fn(),
}

const baseGames = {
  games: [],
  isLoading: false,
  fetchError: '',
  loadGames: vi.fn(),
  addGame: vi.fn(),
  deleteGame: vi.fn(),
  updateGame: vi.fn(),
  nextId: 1,
  newGameId: null,
  setNewGameId: vi.fn(),
}

const renderApp = (gamesOverride = {}) => {
  useModalState.mockReturnValue(baseModalState)
  useCreateGameForm.mockReturnValue(baseCreateForm)
  useGames.mockReturnValue({ ...baseGames, ...gamesOverride })

  return render(<App />)
}

describe('App', () => {
  test('renders skeleton cards while loading', () => {
    const { container } = renderApp({ isLoading: true })

    const skeletons = container.querySelectorAll('.game-card.skeleton')
    expect(skeletons).toHaveLength(4)
  })

  test('renders error state when fetch fails', () => {
    renderApp({ isLoading: false, fetchError: 'Unable to load games.' })

    expect(screen.getByText('Unable to load games.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  test('renders game cards on success', () => {
    renderApp({
      games: [
        {
          id: 1,
          name: 'Game One',
          status: 'active',
          players: [{ name: 'Alex', avatar: 'A' }],
          lastUpdated: 1700000000000,
          createdAt: 1700000000000,
          resumable: true,
        },
      ],
    })

    expect(screen.getByText('Game One')).toBeInTheDocument()
  })

  test('renders start game screen when view is start', () => {
    useModalState.mockReturnValue({
      ...baseModalState,
      state: {
        view: 'start',
        activeGame: {
          id: 2,
          name: 'Start Me',
          players: [{ id: 1, name: 'Alex', avatar: 'A' }],
        },
        activeGameMode: 'resume',
        pendingDelete: null,
      },
    })
    useCreateGameForm.mockReturnValue(baseCreateForm)
    useGames.mockReturnValue(baseGames)

    render(<App />)

    expect(screen.getByText('Start Me')).toBeInTheDocument()
    expect(screen.getByText('Each player must choose a career path before you begin.')).toBeInTheDocument()
  })

  const startViewState = {
    view: 'start',
    activeGame: {
      id: 3,
      name: 'Start Save',
      status: 'new',
      players: [
        { id: 1, name: 'Alex', avatar: 'A' },
        { id: 2, name: 'Sam', avatar: 'S' },
      ],
      createdAt: 1700000000000,
      lastUpdated: 1700000000000,
      currentTurnState: {},
      metadata: {},
      version: 1,
    },
    activeGameMode: 'resume',
    pendingDelete: null,
  }

  const setupStartView = () => {
    useModalState.mockReturnValue({
      ...baseModalState,
      state: startViewState,
    })
    useCreateGameForm.mockReturnValue(baseCreateForm)
    useGames.mockReturnValue(baseGames)
  }

  test('shows error and allows retry when start game save fails', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({ ok: false })
    vi.stubGlobal('fetch', fetchMock)
    Object.assign(import.meta.env, { VITE_API_BASE_URL: 'http://example.test' })

    setupStartView()

    render(<App />)

    const rows = document.querySelectorAll('.career-row')
    await user.click(within(rows[0]).getByRole('radio', { name: 'College' }))
    await user.click(within(rows[1]).getByRole('radio', { name: 'Trades' }))

    const startButton = screen.getByRole('button', { name: 'Start Game' })
    await user.click(startButton)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Unable to save career selections. Please try again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeEnabled()

    delete import.meta.env.VITE_API_BASE_URL
    vi.unstubAllGlobals()
  })

  test('prevents duplicate submissions while saving', async () => {
    const user = userEvent.setup()
    let resolveFetch
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve
    })
    const fetchMock = vi.fn().mockReturnValue(fetchPromise)
    vi.stubGlobal('fetch', fetchMock)
    Object.assign(import.meta.env, { VITE_API_BASE_URL: 'http://example.test' })

    setupStartView()
    render(<App />)

    const rows = document.querySelectorAll('.career-row')
    await user.click(within(rows[0]).getByRole('radio', { name: 'College' }))
    await user.click(within(rows[1]).getByRole('radio', { name: 'Trades' }))

    const startButton = screen.getByRole('button', { name: 'Start Game' })
    await user.dblClick(startButton)

    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveFetch({ ok: false })
    expect(await screen.findByText('Unable to save career selections. Please try again.')).toBeInTheDocument()

    delete import.meta.env.VITE_API_BASE_URL
    vi.unstubAllGlobals()
  })
})
