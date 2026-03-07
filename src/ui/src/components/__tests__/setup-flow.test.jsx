import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import CreateGameModal from '../modals/CreateGameModal'
import { PLAYER_AVATAR_OPTIONS } from '../../data/playerAvatars'

const WizardHarness = ({ onSubmit }) => {
  const [gameName, setGameName] = useState('')
  const [gameNameTouched, setGameNameTouched] = useState(false)
  const [players, setPlayers] = useState([])
  const [draftPlayer, setDraftPlayer] = useState({
    name: '',
    avatar: PLAYER_AVATAR_OPTIONS[0].key,
  })
  const [draftTouched, setDraftTouched] = useState({ name: false })

  const isGameNameValid = gameName.trim().length > 0
  const lowerNames = new Set(players.map((player) => player.name.trim().toLowerCase()))
  const draftName = draftPlayer.name.trim()
  const draftErrors = {
    name: !draftName
      ? 'Nickname is required.'
      : lowerNames.has(draftName.toLowerCase())
        ? 'Names must be unique.'
        : '',
  }

  const onDraftAvatarCycle = () => {
    const currentIndex = PLAYER_AVATAR_OPTIONS.findIndex((option) => option.key === draftPlayer.avatar)
    const nextIndex = (currentIndex + 1) % PLAYER_AVATAR_OPTIONS.length
    setDraftPlayer((current) => ({ ...current, avatar: PLAYER_AVATAR_OPTIONS[nextIndex].key }))
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
      isGameNameValid={isGameNameValid}
      isGameNameTooLong={false}
      maxGameNameLength={60}
      players={players}
      maxPlayerNameLength={24}
      draftPlayer={draftPlayer}
      draftTouched={draftTouched}
      draftErrors={draftErrors}
      onAddPlayer={() => {
        if (draftErrors.name) {
          setDraftTouched({ name: true })
          return
        }
        const newPlayer = {
          id: `p-${players.length + 1}`,
          name: draftName,
          avatar: draftPlayer.avatar,
        }
        setPlayers((current) => [...current, newPlayer])
        setDraftPlayer((current) => ({ ...current, name: '' }))
      }}
      onRemovePlayer={(playerId) => setPlayers((current) => current.filter((player) => player.id !== playerId))}
      onDraftNameChange={(event) => setDraftPlayer((current) => ({ ...current, name: event.target.value }))}
      onDraftBlur={(field) => setDraftTouched((current) => ({ ...current, [field]: true }))}
      onDraftAvatarCycle={onDraftAvatarCycle}
      createError=""
      isCreating={false}
    />
  )
}

describe('New game setup flow', () => {
  it('enforces step contracts and submits a six-step payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<WizardHarness onSubmit={onSubmit} />)

    const firstNextButton = screen.getByRole('button', { name: 'Next' })
    expect(firstNextButton).toBeDisabled()

    await user.type(screen.getByLabelText('Game Name:'), '  Family Setup  ')
    expect(firstNextButton).toBeEnabled()
    await user.click(firstNextButton)

    expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()
    expect(screen.getByText('Player Name:')).toBeInTheDocument()
    expect(screen.getByText('Choose Your Digital Persona:')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Player Name:'), 'Ari')
    await user.click(screen.getByRole('button', { name: '+ Add Player' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.click(screen.getByRole('radio', { name: 'San Francisco, CA' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.click(screen.getByRole('radio', { name: 'Degree Track' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    const footerRow = screen.getByRole('button', { name: 'Back' }).closest('.wizard-footer-row')
    expect(footerRow).toBeTruthy()
    expect(within(footerRow).getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(within(footerRow).getByRole('button', { name: 'Next' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Software Engineer' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Step 6 of 6')).toBeInTheDocument()
    const summaryNameInput = screen.getByLabelText('Game Name:')
    await user.clear(summaryNameInput)
    await user.type(summaryNameInput, 'Final Family Setup')

    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '+ New Player' }))
    await user.type(screen.getByLabelText('Player Name:'), 'Mira')
    await user.click(screen.getByRole('button', { name: '+ Add Player' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.click(screen.getByRole('radio', { name: 'Austin, TX' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('radio', { name: 'Trades Track' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('radio', { name: 'Electrician' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.click(screen.getByRole('button', { name: 'Start Game' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Final Family Setup',
      players: [
        expect.objectContaining({
          id: 'p-1',
          name: 'Ari',
          cityId: 'san-francisco',
          educationTrackId: 'degree-track',
          jobId: 'software-engineer',
          careerTrack: 'Degree Track',
        }),
        expect.objectContaining({
          id: 'p-2',
          name: 'Mira',
          cityId: 'austin',
          educationTrackId: 'trades-track',
          jobId: 'electrician',
          careerTrack: 'Trades Track',
        }),
      ],
    })
  })
})
