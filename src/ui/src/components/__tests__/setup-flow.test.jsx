import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import NewGameWizard from '../forms/NewGameWizard'
import { DEFAULT_PLAYER_AVATAR_KEY } from '../../data/playerAvatars'

const renderWizard = (overrides = {}) => {
  const props = {
    isOpen: true,
    isCreating: false,
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
    gameName: '',
    maxGameNameLength: 60,
    maxPlayerNameLength: 24,
    players: [],
    draftPlayer: { name: '', avatar: DEFAULT_PLAYER_AVATAR_KEY },
    onGameNameChange: vi.fn(),
    onDraftNameChange: vi.fn(),
    onDraftAvatarCycle: vi.fn(),
    onAddPlayer: vi.fn(),
    onRemovePlayer: vi.fn(),
    ...overrides,
  }

  return {
    ...render(<NewGameWizard {...props} />),
    props,
  }
}

describe('NewGameWizard', () => {
  it('walks through all six steps and submits the final payload', async () => {
    const user = userEvent.setup()
    const { props } = renderWizard()

    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).toBeDisabled()

    await user.type(screen.getByLabelText('Game Name:'), 'Choices Matter')
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('New Player Setup')).toBeInTheDocument()
    expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Player Name:'), 'Jack')
    await user.click(screen.getByRole('button', { name: 'Choose Robot persona' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('New Player Setup - Pick City')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Denver/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('New Player Setup - Education Track')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Trades Track/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('New Player Setup - Pick a Career')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Electrician/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('New Game - Summary')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()

    await user.clear(screen.getByLabelText('Game Name:'))
    await user.type(screen.getByLabelText('Game Name:'), 'Family Future')
    await user.click(screen.getByRole('button', { name: '+ New Player' }))

    await user.type(screen.getByLabelText('Player Name:'), 'Mia')
    await user.click(screen.getByRole('button', { name: 'Choose Cat persona' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: /San Francisco/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getAllByRole('button', { name: /Degree Track/i })[0])
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: /Dental Hygienist/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('button', { name: 'Start Game' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Start Game' }))

    expect(props.onSubmit).toHaveBeenCalledWith({
      name: 'Family Future',
      players: [
        {
          id: 'wizard-player-1',
          name: 'Jack',
          avatar: 'robot',
          cityId: 'denver',
          educationTrackId: 'trades-track',
          jobId: 'electrician',
          careerTrack: 'Trades Track',
        },
        {
          id: 'wizard-player-2',
          name: 'Mia',
          avatar: 'cat',
          cityId: 'san-francisco',
          educationTrackId: 'degree-track',
          jobId: 'dental-hygienist',
          careerTrack: 'Degree Track',
        },
      ],
    })
  })

  it('keeps player names unique before advancing from step two', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.type(screen.getByLabelText('Game Name:'), 'Choices Matter')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.type(screen.getByLabelText('Player Name:'), 'Jack')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: '+ New Player' }))

    await user.type(screen.getByLabelText('Player Name:'), 'Jack')
    expect(screen.getByText('Names must be unique.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
})
