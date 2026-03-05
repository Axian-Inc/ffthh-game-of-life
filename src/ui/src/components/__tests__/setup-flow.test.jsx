import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import NewGameWizard from '../forms/NewGameWizard'

const WizardHarness = () => {
  const [players, setPlayers] = useState([])
  const [draftPlayer, setDraftPlayer] = useState({ name: '', avatar: 'octopus' })

  return (
    <NewGameWizard
      gameName="New Game"
      onGameNameChange={vi.fn()}
      onSubmit={vi.fn()}
      onAddPlayer={() => {
        if (!draftPlayer.name.trim()) {
          return false
        }
        setPlayers((current) => [...current, { id: `${current.length + 1}`, name: draftPlayer.name.trim() }])
        setDraftPlayer((current) => ({ ...current, name: '' }))
        return true
      }}
      onDraftNameChange={(event) =>
        setDraftPlayer((current) => ({
          ...current,
          name: event.target.value,
        }))
      }
      draftPlayer={draftPlayer}
      players={players}
      isCreating={false}
    />
  )
}

const renderWizard = () =>
  render(
    <WizardHarness />,
  )

const completePlayerToSummary = async (user, name, trackName, jobName) => {
  await user.type(screen.getByPlaceholderText('Enter a distinct name...'), name)
  await user.click(screen.getByRole('button', { name: 'Next' }))

  await user.click(screen.getByRole('button', { name: /Denver/ }))
  await user.click(screen.getByRole('button', { name: 'Next' }))

  await user.click(screen.getByRole('button', { name: new RegExp(trackName, 'i') }))
  await user.click(screen.getByRole('button', { name: 'Next' }))

  await user.click(screen.getByRole('button', { name: new RegExp(jobName, 'i') }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
}

describe('New game wizard setup flow', () => {
  it('shows exact city card count and trades jobs filtered in step 4', async () => {
    const user = userEvent.setup()
    renderWizard()

    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Enter a distinct name...'), 'Rin')
    expect(nextButton).toBeEnabled()
    await user.click(nextButton)

    const cityGroup = screen.getByRole('group', { name: 'Pick a city' })
    expect(within(cityGroup).getAllByRole('button')).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: /Denver/ }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.click(screen.getByRole('button', { name: /Trades Track/ }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('button', { name: /Dental Hygienist/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Electrician/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Mechanic/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Anesthetist/ })).not.toBeInTheDocument()
  })

  it('retains step selections when navigating back', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.type(screen.getByPlaceholderText('Enter a distinct name...'), 'Ari')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: /Tonopah, NV/ }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
  })

  it('keeps start disabled for one player and enables with two configured players', async () => {
    const user = userEvent.setup()
    renderWizard()

    await completePlayerToSummary(user, 'Mira', 'Degree Track', 'Anesthetist')

    const startButton = screen.getByRole('button', { name: 'Start Game' })
    expect(startButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '+ New Player' }))
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()

    await completePlayerToSummary(user, 'Jules', 'Self-Taught Track', 'Vibe Coder')

    expect(screen.getByText('Name: Mira')).toBeInTheDocument()
    expect(screen.getByText('Name: Jules')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeEnabled()
  })
})
