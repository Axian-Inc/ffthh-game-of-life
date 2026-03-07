import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import StartNewGamePage from '../pages/StartNewGamePage'
import useCreateGameForm from '../../hooks/useCreateGameForm'

const SetupHarness = ({ onStart = vi.fn() }) => {
  const form = useCreateGameForm()

  return (
    <StartNewGamePage
      draft={form.draft}
      currentStep={form.currentStep}
      minPlayers={form.minPlayers}
      maxGameNameLength={form.maxGameNameLength}
      maxPlayerNameLength={form.maxPlayerNameLength}
      gameNameTouched={form.gameNameTouched}
      isGameNameValid={form.isGameNameValid}
      isGameNameTooLong={form.isGameNameTooLong}
      arePlayersValid={form.arePlayersValid}
      isDraftIdentityValid={form.isDraftIdentityValid}
      isDraftPlayerConfigured={form.isDraftPlayerConfigured}
      onGameNameChange={form.setGameName}
      onGameNameBlur={() => form.setGameNameTouched(true)}
      onDraftNameChange={form.updateDraftName}
      onDraftFieldChange={form.updateDraftPlayerField}
      onDraftAvatarCycle={form.cycleDraftAvatar}
      onDraftBlur={form.markDraftTouched}
      onNextStep={form.goToNextStep}
      onPreviousStep={form.goToPreviousStep}
      onAddPlayer={({ careerTrack }) => form.addPlayer({ careerTrack })}
      onRemovePlayer={form.removePlayer}
      onStartNewPlayer={form.startNewPlayer}
      onStart={onStart}
      onBack={vi.fn()}
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
  await user.click(screen.getByRole('button', { name: education }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: job }))
  await user.click(screen.getByRole('button', { name: 'Review Summary' }))
}

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
