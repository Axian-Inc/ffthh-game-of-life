import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import CreateGameModal from '../modals/CreateGameModal'
import useCreateGameForm from '../../hooks/useCreateGameForm'
import useGames from '../../hooks/useGames'
import { GAME_STORAGE_KEY } from '../../services/gameStorage'
import { createGame, createPlayer } from '../../test/testUtils'

const buildProps = (overrides = {}) => ({
  isOpen: true,
  onBackdropClick: vi.fn(),
  onCancel: vi.fn(),
  onSubmit: vi.fn(),
  gameName: '',
  onGameNameChange: vi.fn(),
  onGameNameBlur: vi.fn(),
  gameNameTouched: false,
  isGameNameValid: false,
  isGameNameTooLong: false,
  maxGameNameLength: 60,
  players: [],
  minPlayers: 1,
  maxPlayerNameLength: 24,
  draftPlayer: { name: '', avatar: 'octopus' },
  draftTouched: { name: false },
  draftErrors: { name: '' },
  arePlayersValid: false,
  onAddPlayer: vi.fn(),
  onRemovePlayer: vi.fn(),
  onDraftNameChange: vi.fn(),
  onDraftBlur: vi.fn(),
  onDraftAvatarCycle: vi.fn(),
  createError: '',
  isCreating: false,
  ...overrides,
})

describe('Wave 1 setup and persistence contract', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('keeps one authoritative draft and prevents duplicate player names', async () => {
    const { result } = renderHook(() => useCreateGameForm())

    act(() => {
      result.current.setGameName('Step 1 Title')
      result.current.setCurrentStep(3)
      result.current.setDraftPlayerData({
        name: 'Ari',
        cityId: 'city-1',
        educationTrackId: 'education-1',
        jobId: 'job-1',
      })
    })

    await act(async () => {
      result.current.addPlayer()
    })

    expect(result.current.players).toHaveLength(1)
    expect(result.current.players[0]).toMatchObject({
      name: 'Ari',
      cityId: 'city-1',
      educationTrackId: 'education-1',
      jobId: 'job-1',
      careerTrack: '',
    })

    act(() => {
      result.current.setDraftPlayerData({ name: 'Ari' })
    })
    expect(result.current.draftErrors.name).toBe('Names must be unique.')

    act(() => {
      result.current.setDraftPlayerData({
        name: 'Blake',
        cityId: 'city-2',
        educationTrackId: 'education-2',
        jobId: 'job-2',
      })
    })

    expect(result.current.players[0]).toMatchObject({
      name: 'Ari',
      cityId: 'city-1',
      educationTrackId: 'education-1',
      jobId: 'job-1',
    })
    expect(result.current.setupDraft).toMatchObject({
      name: 'Step 1 Title',
      currentStep: 3,
      players: [expect.objectContaining({ name: 'Ari' })],
      draftPlayer: expect.objectContaining({
        name: 'Blake',
        cityId: 'city-2',
      }),
    })
  })

  it('persists only on Start Game and saves final title plus all committed players', async () => {
    const baselineGame = createGame({ id: 'existing-1', name: 'Existing Save' })
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([baselineGame]))

    const { result } = renderHook(() => useGames())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.games).toHaveLength(1)

    let draftGame
    await act(async () => {
      draftGame = await result.current.createGame({
        name: 'Step 1 Working Title',
        status: 'active',
        currentStep: 6,
        players: [
          createPlayer({
            id: 'p-1',
            name: 'Ari',
            cityId: 'city-1',
            educationTrackId: 'education-1',
            jobId: 'job-1',
            careerTrack: 'Degree Track',
          }),
          createPlayer({
            id: 'p-2',
            name: 'Blake',
            cityId: 'city-2',
            educationTrackId: 'education-2',
            jobId: 'job-2',
            careerTrack: 'Trades Track',
          }),
        ],
        lastUpdated: Date.now(),
        createdAt: Date.now(),
        resumable: true,
      })
    })

    expect(result.current.games).toHaveLength(1)
    const gamesBeforeStart = JSON.parse(window.localStorage.getItem(GAME_STORAGE_KEY) || '[]')
    expect(gamesBeforeStart).toHaveLength(1)
    expect(gamesBeforeStart.some((game) => game.id === draftGame.id)).toBe(false)

    await act(async () => {
      await result.current.updateGame(draftGame.id, {
        ...draftGame,
        name: 'Final Step 6 Title',
        currentStep: 0,
      })
    })

    expect(result.current.games[0]).toMatchObject({
      id: draftGame.id,
      name: 'Final Step 6 Title',
      currentStep: 0,
    })

    const persistedGames = JSON.parse(window.localStorage.getItem(GAME_STORAGE_KEY) || '[]')
    const created = persistedGames.find((game) => game.id === draftGame.id)
    expect(created).toMatchObject({
      name: 'Final Step 6 Title',
      players: [
        expect.objectContaining({
          id: 'p-1',
          name: 'Ari',
          cityId: 'city-1',
          educationTrackId: 'education-1',
          jobId: 'job-1',
          careerTrack: 'Degree Track',
        }),
        expect.objectContaining({
          id: 'p-2',
          name: 'Blake',
          cityId: 'city-2',
          educationTrackId: 'education-2',
          jobId: 'job-2',
          careerTrack: 'Trades Track',
        }),
      ],
    })
    expect(result.current.newGameId).toBe(draftGame.id)
  })
})

describe('New game setup flow UI', () => {
  it('disables Step 1 next until game name is valid', async () => {
    const user = userEvent.setup()
    const onGameNameChange = vi.fn()
    const props = buildProps({
      onGameNameChange,
      isGameNameValid: false,
      gameName: '',
    })

    const { rerender } = render(<CreateGameModal {...props} />)

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    const nameInput = screen.getByLabelText('Game Name:')
    await user.type(nameInput, 'Alpha')
    expect(onGameNameChange).toHaveBeenCalled()

    rerender(
      <CreateGameModal
        {...props}
        isGameNameValid
        gameName="Alpha"
      />,
    )

    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
  })

  it('submits Step 6 payload with editable game title', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <CreateGameModal
        {...buildProps({
          gameName: 'Initial Name',
          isGameNameValid: true,
          onSubmit,
        })}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.type(screen.getByPlaceholderText('Player nickname'), 'Riley')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Step 6 of 6')).toBeInTheDocument()
    expect(screen.getByLabelText('Game Name:')).toBeInTheDocument()

    const gameNameInput = screen.getByLabelText('Game Name:')
    await user.clear(gameNameInput)
    await user.type(gameNameInput, 'Edited Name')

    await user.click(screen.getByRole('button', { name: '+ New Player' }))
    await user.type(screen.getByPlaceholderText('Player nickname'), 'Jordan')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.click(screen.getByRole('button', { name: /Start Game with 2 Players/ }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Edited Name',
      players: [
        expect.objectContaining({
          id: 'player-1',
          name: 'Riley',
          cityId: expect.any(String),
          educationTrackId: expect.any(String),
          jobId: expect.any(String),
          careerTrack: expect.any(String),
        }),
        expect.objectContaining({
          id: 'player-2',
          name: 'Jordan',
          cityId: expect.any(String),
          educationTrackId: expect.any(String),
          jobId: expect.any(String),
          careerTrack: expect.any(String),
        }),
      ],
    })
  })
})
