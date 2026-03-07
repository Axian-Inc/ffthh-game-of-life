import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import CreateGameModal from '../modals/CreateGameModal'

const WizardHarness = ({ onSubmit = vi.fn(), initialPlayers = [] }) => {
  const [gameName, setGameName] = useState('')
  const [players, setPlayers] = useState(initialPlayers)
  const [draftPlayer, setDraftPlayer] = useState({ name: '', avatar: 'octopus' })
  const [draftTouched, setDraftTouched] = useState({ name: false })

  const avatarOrder = [
    'octopus',
    'snake',
    'turtle',
    'lizard',
    'crocodile',
    't-rex',
    'sauropod',
    'dragon',
    'dragon-face',
    'scorpion',
    'bat',
    'crab',
    'squid',
    'shrimp',
    'lobster',
    'shark',
    'whale',
    'dolphin',
    'blowfish',
    'jellyfish',
    'monkey-face',
    'gorilla',
    'fox',
    'cat-face',
    'lion',
  ]

  return (
    <CreateGameModal
      isOpen
      onBackdropClick={vi.fn()}
      onCancel={vi.fn()}
      onSubmit={onSubmit}
      gameName={gameName}
      onGameNameChange={(event) => setGameName(event.target.value)}
      onGameNameBlur={vi.fn()}
      gameNameTouched={false}
      isGameNameValid={gameName.trim().length > 0}
      isGameNameTooLong={false}
      maxGameNameLength={60}
      players={players}
      minPlayers={1}
      maxPlayerNameLength={24}
      draftPlayer={draftPlayer}
      draftTouched={draftTouched}
      draftErrors={{ name: draftPlayer.name.trim() ? '' : 'Nickname is required.' }}
      arePlayersValid
      onAddPlayer={() => {
        setPlayers((current) => [...current, { id: String(current.length + 1), ...draftPlayer }])
        setDraftPlayer((current) => ({ ...current, name: '' }))
        setDraftTouched({ name: false })
      }}
      onRemovePlayer={vi.fn()}
      onDraftNameChange={(event) => setDraftPlayer((current) => ({ ...current, name: event.target.value }))}
      onDraftBlur={() => setDraftTouched({ name: true })}
      onDraftAvatarCycle={() => {
        setDraftPlayer((current) => {
          const index = avatarOrder.indexOf(current.avatar)
          const nextIndex = (index + 1) % avatarOrder.length
          return { ...current, avatar: avatarOrder[nextIndex] }
        })
      }}
      createError=""
      isCreating={false}
    />
  )
}

describe('setup flow wizard', () => {
  it('runs six-step flow and submits payload with summary game name', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<WizardHarness onSubmit={onSubmit} initialPlayers={[{ id: 'seed-1', name: 'Mia', avatar: 'dragon' }]} />)

    await user.type(screen.getByLabelText('Game Name:'), 'Choices Matter')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.type(screen.getByLabelText('Player Name:'), 'Jack')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.click(screen.getByRole('button', { name: /^Tonopah, NV/ }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.click(screen.getByRole('button', { name: /^Degree Track/ }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    const jobCards = screen.getAllByRole('button', { name: /Electrician|Dental Hygienist|Mechanic/ })
    await user.click(jobCards[0])
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Step 6 of 6')).toBeInTheDocument()

    const summaryField = screen.getByLabelText('Game Name:')
    await user.clear(summaryField)
    await user.type(summaryField, 'Edited Name')

    await user.click(screen.getByRole('button', { name: 'Start Game' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0][0]
    expect(payload).toMatchObject({ name: 'Edited Name' })
    expect(payload.players).toHaveLength(2)
    expect(payload.players[1]).toEqual(
      expect.objectContaining({
        name: 'Jack',
        cityId: 'tonopah',
        educationTrackId: 'degree-track',
      }),
    )
  })

  it('keeps step 5 footer actions on a single row class', async () => {
    const user = userEvent.setup()
    render(<WizardHarness />)

    await user.type(screen.getByLabelText('Game Name:'), 'Test')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.type(screen.getByLabelText('Player Name:'), 'Alex')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    const footer = screen.getByRole('button', { name: 'Back' }).closest('footer')
    expect(footer).toHaveClass('wizard-footer')
    expect(within(footer).getByRole('button', { name: 'Back' })).toBeVisible()
    expect(within(footer).getByRole('button', { name: 'Next' })).toBeVisible()
  })
})
