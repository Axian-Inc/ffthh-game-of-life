import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import CreateGameModal from '../modals/CreateGameModal'

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

describe('New game setup flow', () => {
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
