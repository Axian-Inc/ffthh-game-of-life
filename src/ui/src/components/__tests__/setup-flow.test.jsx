import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import NewGameWizard from '../forms/NewGameWizard'
import StartNewGamePage from '../pages/StartNewGamePage'
import { DEFAULT_PLAYER_AVATAR_KEY } from '../../data/playerAvatars'
import useCreateGameForm from '../../hooks/useCreateGameForm'

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

const SetupHarness = ({ onStart = vi.fn() }) => {
  const form = useCreateGameForm()

  return (
    <StartNewGamePage
      arePlayersValid={form.arePlayersValid}
      currentStep={form.currentStep}
      draft={form.draft}
      gameNameTouched={form.gameNameTouched}
      isDraftIdentityValid={form.isDraftIdentityValid}
      isDraftPlayerConfigured={form.isDraftPlayerConfigured}
      isGameNameTooLong={form.isGameNameTooLong}
      isGameNameValid={form.isGameNameValid}
      maxGameNameLength={form.maxGameNameLength}
      maxPlayerNameLength={form.maxPlayerNameLength}
      minPlayers={form.minPlayers}
      onAddPlayer={({ careerTrack }) => form.addPlayer({ careerTrack })}
      onBack={vi.fn()}
      onDraftAvatarCycle={form.cycleDraftAvatar}
      onDraftBlur={form.markDraftTouched}
      onDraftFieldChange={form.updateDraftPlayerField}
      onDraftNameChange={form.updateDraftName}
      onGameNameBlur={() => form.setGameNameTouched(true)}
      onGameNameChange={form.setGameName}
      onNextStep={form.goToNextStep}
      onPreviousStep={form.goToPreviousStep}
      onRemovePlayer={form.removePlayer}
      onStart={onStart}
      onStartNewPlayer={form.startNewPlayer}
    />
  )
}

const configurePlayer = async (
  user,
  {
    name = 'Alex',
    city = 'Denver, CO',
    education = 'Degree Track',
    job = 'Veterinarian',
  } = {},
) => {
  await user.type(screen.getByLabelText('Player Name:'), name)
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: city }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getAllByRole('button', { name: education })[0])
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getAllByRole('button', { name: job })[0])
  await user.click(screen.getByRole('button', { name: 'Review Summary' }))
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
    await user.click(screen.getAllByRole('button', { name: /Trades Track/i })[0])
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('New Player Setup - Pick a Career')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /Electrician/i })[0])
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
    await user.click(screen.getAllByRole('button', { name: /Dental Hygienist/i })[0])
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

describe('Setup flow', () => {
  it('keeps the draft local, edits the final title, and loops back for another player', async () => {
    const user = userEvent.setup()
    render(<SetupHarness />)

    await user.type(screen.getByLabelText('Game Name:'), 'Draft Name')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await configurePlayer(user)

    expect(screen.getByRole('heading', { name: 'New Game - Summary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()

    const summaryName = screen.getByLabelText('Game Name:')
    await user.clear(summaryName)
    await user.type(summaryName, 'Final Family Night')

    expect(screen.getByDisplayValue('Final Family Night')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+ New Player' }))

    expect(screen.getByRole('heading', { name: 'New Player Setup' })).toBeInTheDocument()
    expect(screen.getByText('Configuring Player 2')).toBeInTheDocument()
  })

  it('requires two committed players before start', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<SetupHarness onStart={onStart} />)

    await user.type(screen.getByLabelText('Game Name:'), 'Persistence Test')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await configurePlayer(user, {
      name: 'Alex',
      city: 'Denver, CO',
      education: 'Degree Track',
      job: 'Veterinarian',
    })
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '+ New Player' }))
    await configurePlayer(user, {
      name: 'Blake',
      city: 'Portland, OR',
      education: 'Trades Track',
      job: 'Electrician',
    })

    const startButton = screen.getByRole('button', { name: 'Start Game' })
    expect(startButton).toBeEnabled()

    await user.click(startButton)
    expect(onStart).toHaveBeenCalledTimes(1)
  })
})
