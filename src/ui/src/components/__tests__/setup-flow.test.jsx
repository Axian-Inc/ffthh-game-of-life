import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
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
})
