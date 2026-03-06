import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import CreateGameModal from '../modals/CreateGameModal'

const SetupFlowHarness = ({ onSubmit = vi.fn() }) => {
  const [gameName, setGameName] = useState('')
  const [gameNameTouched, setGameNameTouched] = useState(false)
  const [players, setPlayers] = useState([])
  const [draftPlayer, setDraftPlayer] = useState({ name: '', avatar: 'octopus' })
  const [draftTouched, setDraftTouched] = useState({ name: false })

  const draftErrors = {
    name: draftPlayer.name.trim() ? '' : 'Enter a player name.',
  }

  return (
    <CreateGameModal
      isOpen
      onBackdropClick={vi.fn()}
      onCancel={vi.fn()}
      onSubmit={onSubmit}
      gameName={gameName}
      onGameNameChange={(event) => setGameName(event.target.value)}
      onGameNameBlur={() => setGameNameTouched(true)}
      gameNameTouched={gameNameTouched}
      isGameNameValid={gameName.trim().length > 0}
      isGameNameTooLong={false}
      maxGameNameLength={60}
      players={players}
      minPlayers={1}
      maxPlayerNameLength={24}
      draftPlayer={draftPlayer}
      draftTouched={draftTouched}
      draftErrors={draftErrors}
      arePlayersValid
      onAddPlayer={() => {
        if (!draftPlayer.name.trim()) {
          setDraftTouched({ name: true })
          return false
        }

        setPlayers((current) => [
          ...current,
          {
            id: `player-${current.length + 1}`,
            name: draftPlayer.name.trim(),
            avatar: draftPlayer.avatar,
          },
        ])
        setDraftPlayer({ name: '', avatar: 'octopus' })
        setDraftTouched({ name: false })
        return true
      }}
      onRemovePlayer={vi.fn()}
      onDraftNameChange={(event) => setDraftPlayer((current) => ({ ...current, name: event.target.value }))}
      onDraftBlur={(field) => setDraftTouched((current) => ({ ...current, [field]: true }))}
      onDraftAvatarCycle={() =>
        setDraftPlayer((current) => ({
          ...current,
          avatar: current.avatar === 'octopus' ? 'snake' : 'octopus',
        }))
      }
      createError=""
      isCreating={false}
    />
  )
}

const addPlayerThroughWizard = async (user, name) => {
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.type(screen.getByLabelText('Player Name:'), name)
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
}

describe('setup flow wizard', () => {
  it('keeps start disabled until two configured players exist', async () => {
    const user = userEvent.setup()
    render(<SetupFlowHarness />)

    await user.type(screen.getByLabelText('Game Name:'), 'Choices Matter')
    await addPlayerThroughWizard(user, 'Ari')

    expect(await screen.findByRole('button', { name: 'Start Game' })).toBeDisabled()
    expect(screen.getByText('Step 6 of 6')).toBeInTheDocument()
  })

  it('submits the final payload with the edited summary title', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SetupFlowHarness onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Game Name:'), 'Original')
    await addPlayerThroughWizard(user, 'Ari')
    await user.click(await screen.findByRole('button', { name: '+ New Player' }))
    await user.type(screen.getByLabelText('Player Name:'), 'Mia')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.clear(screen.getByLabelText('Game Name:'))
    await user.type(screen.getByLabelText('Game Name:'), 'Updated Title')
    await user.click(screen.getByRole('button', { name: 'Start Game' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Updated Title',
        players: [
          expect.objectContaining({
            name: 'Ari',
            cityId: 'denver',
            educationTrackId: 'trades-track',
            jobId: 'electrician',
            careerTrack: 'Trades Track',
          }),
          expect.objectContaining({
            name: 'Mia',
            cityId: 'denver',
            educationTrackId: 'trades-track',
            jobId: 'electrician',
            careerTrack: 'Trades Track',
          }),
        ],
      }),
    )
  })
})
