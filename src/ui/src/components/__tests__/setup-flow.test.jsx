import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from '../../App'
import CreateGameModal from '../modals/CreateGameModal'

const baseProps = {
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
  draftPlayer: { name: '', avatar: 'rocket' },
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
}

const STORAGE_KEY = 'ffthh-game-of-life.games'

const getStoredGames = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')

const createPlayer = async (user, { name, avatar, city, track, job }) => {
  await user.clear(screen.getByLabelText('Player Name:'))
  await user.type(screen.getByLabelText('Player Name:'), name)
  await user.click(screen.getByRole('button', { name: avatar }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: city }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: track }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: job }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
}

describe('New game setup flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('keeps Next disabled until the game name is non-empty', async () => {
    const user = userEvent.setup()
    render(<CreateGameModal {...baseProps} />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).toBeDisabled()

    await user.type(screen.getByLabelText('Game Name:'), '   ')
    expect(nextButton).toBeDisabled()

    await user.clear(screen.getByLabelText('Game Name:'))
    await user.type(screen.getByLabelText('Game Name:'), 'Choices Matter')
    expect(nextButton).toBeEnabled()
  })

  it('submits the edited summary title with a final immutable payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const sourcePlayers = Object.freeze([
      Object.freeze({
        id: 'seed-player',
        name: 'Seed',
        avatar: 'rocket',
        cityId: 'denver',
        educationTrackId: 'trades-track',
        jobId: 'electrician',
        careerTrack: 'Trades Track',
      }),
    ])

    render(<CreateGameModal {...baseProps} players={sourcePlayers} gameName="Original Name" onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await createPlayer(user, {
      name: 'Mia',
      avatar: 'Cat',
      city: 'San Francisco',
      track: 'Degree Track',
      job: 'Dental Hygienist',
    })

    const startButton = screen.getByRole('button', { name: 'Start Game' })
    expect(startButton).toBeEnabled()

    await user.clear(screen.getByLabelText('Game Name:'))
    await user.type(screen.getByLabelText('Game Name:'), 'Edited Summary Name')
    await user.click(startButton)

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Edited Summary Name',
      players: [
        {
          id: 'seed-player',
          name: 'Seed',
          avatar: 'rocket',
          cityId: 'denver',
          educationTrackId: 'trades-track',
          jobId: 'electrician',
          careerTrack: 'Trades Track',
        },
        {
          id: 'player-2',
          name: 'Mia',
          avatar: 'cat',
          cityId: 'san-francisco',
          educationTrackId: 'degree-track',
          jobId: 'dental-hygienist',
          careerTrack: 'Degree Track',
        },
      ],
    })
    expect(sourcePlayers).toEqual([
      {
        id: 'seed-player',
        name: 'Seed',
        avatar: 'rocket',
        cityId: 'denver',
        educationTrackId: 'trades-track',
        jobId: 'electrician',
        careerTrack: 'Trades Track',
      },
    ])
  })

  it('requires at least two players before Start Game is enabled', async () => {
    const user = userEvent.setup()
    render(<CreateGameModal {...baseProps} gameName="Choices Matter" />)

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await createPlayer(user, {
      name: 'Jack',
      avatar: 'Robot',
      city: 'Denver',
      track: 'Trades Track',
      job: 'Electrician',
    })

    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()
    expect(screen.getByText('Add at least two players to start the game.')).toBeInTheDocument()
  })

  it('persists a new game only after the final start action and keeps both players', async () => {
    const user = userEvent.setup()
    render(<App />)

    const initialCount = getStoredGames().length

    await user.click(screen.getByRole('button', { name: 'New Game' }))
    await user.type(screen.getByLabelText('Game Name:'), 'Draft Contract')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await createPlayer(user, {
      name: 'Alex',
      avatar: 'Robot',
      city: 'Denver',
      track: 'Degree Track',
      job: 'Dental Hygienist',
    })

    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()
    expect(getStoredGames()).toHaveLength(initialCount)
    expect(getStoredGames().some((game) => game.name === 'Draft Contract')).toBe(false)

    await user.click(screen.getByRole('button', { name: '+ New Player' }))
    await createPlayer(user, {
      name: 'Bailey',
      avatar: 'Cat',
      city: 'San Francisco',
      track: 'Trades Track',
      job: 'Electrician',
    })

    const startButton = screen.getByRole('button', { name: 'Start Game' })
    expect(startButton).toBeEnabled()

    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Welcome to Life!' })).toBeInTheDocument()
    })

    let savedGame
    await waitFor(() => {
      savedGame = getStoredGames().find((game) => game.name === 'Draft Contract')
      expect(savedGame).toBeDefined()
    })
    expect(savedGame.players).toHaveLength(2)
    expect(savedGame.players).toEqual([
      expect.objectContaining({
        name: 'Alex',
        cityId: 'denver',
        educationTrackId: 'degree-track',
        jobId: 'dental-hygienist',
        careerTrack: 'Degree Track',
      }),
      expect.objectContaining({
        name: 'Bailey',
        cityId: 'san-francisco',
        educationTrackId: 'trades-track',
        jobId: 'electrician',
        careerTrack: 'Trades Track',
      }),
    ])

    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Draft Contract' })).toBeInTheDocument()
    })
  })
})
