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
  it('covers wizard step gating, card counts, summary, player loop, and final payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <CreateGameModal
        {...buildProps({
          gameName: '',
          isGameNameValid: false,
          onSubmit,
        })}
      />,
    )

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    const gameNameInput = screen.getByLabelText('Game Name:')
    await user.type(gameNameInput, 'Edited Name')
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()

    const personaGroup = screen.getByRole('radiogroup', { name: 'Choose your digital persona' })
    expect(personaGroup).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Snake' }))
    expect(screen.getByRole('radio', { name: 'Snake' })).toHaveAttribute('aria-checked', 'true')

    await user.type(screen.getByPlaceholderText('Player nickname'), 'Riley')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Step 3 of 6')).toBeInTheDocument()
    expect(screen.getByTestId('wizard-step-3').querySelectorAll('.wizard-rail-card')).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: /Sunset Bay/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Step 4 of 6')).toBeInTheDocument()
    expect(screen.getByTestId('wizard-step-4').querySelectorAll('.wizard-rail-card')).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: /Trades Track/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Step 5 of 6')).toBeInTheDocument()
    expect(screen.getByTestId('wizard-step-5').querySelectorAll('.wizard-job-card')).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: /Electrician/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Step 6 of 6')).toBeInTheDocument()
    expect(screen.getByText('Riley')).toBeInTheDocument()
    const firstPlayerSummary = screen.getByText('Riley').closest('article')
    expect(firstPlayerSummary).toHaveTextContent('City: Sunset Bay')
    expect(firstPlayerSummary).toHaveTextContent('Education: Trades Track')
    expect(firstPlayerSummary).toHaveTextContent('Job: Electrician')
    expect(screen.getByRole('button', { name: /Start Game with 1 Player/ })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '+ New Player' }))
    expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Player nickname'), 'Jordan')
    await user.click(screen.getByRole('radio', { name: 'Fox' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: /Maple Heights/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: /Creator Track/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: /Content Creator/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Riley')).toBeInTheDocument()
    expect(screen.getByText('Jordan')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start Game with 2 Players/ })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: /Start Game with 2 Players/ }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Edited Name',
      players: [
        {
          id: 'player-1',
          name: 'Riley',
          avatar: 'snake',
          cityId: 'sunset-bay',
          educationTrackId: 'trades-track',
          jobId: 'electrician',
          careerTrack: 'Trades Track',
        },
        {
          id: 'player-2',
          name: 'Jordan',
          avatar: 'fox',
          cityId: 'maple-heights',
          educationTrackId: 'creator-track',
          jobId: 'content-creator',
          careerTrack: 'Creator Track',
        },
      ],
    })
  })
})
