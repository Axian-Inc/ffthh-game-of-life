import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PlayersSection from '../forms/PlayersSection'
import { createPlayer } from '../../test/testUtils'

describe('PlayersSection', () => {
  const baseProps = {
    players: [],
    minPlayers: 1,
    maxPlayerNameLength: 24,
    draftPlayer: { name: '', avatar: 'monkey-face' },
    draftTouched: { name: false },
    draftErrors: { name: '' },
    arePlayersValid: true,
    onAddPlayer: vi.fn(),
    onRemovePlayer: vi.fn(),
    onDraftNameChange: vi.fn(),
    onDraftBlur: vi.fn(),
    onDraftAvatarCycle: vi.fn(),
    isCreating: false,
  }

  it('renders summary and allows adding player', async () => {
    const user = userEvent.setup()
    const onAddPlayer = vi.fn()
    render(<PlayersSection {...baseProps} onAddPlayer={onAddPlayer} />)

    expect(screen.getByText('Players (0)')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add Player' }))
    expect(onAddPlayer).toHaveBeenCalledTimes(1)
  })

  it('renders existing players with remove actions', async () => {
    const user = userEvent.setup()
    const onRemovePlayer = vi.fn()
    const players = [createPlayer({ id: 'p1', name: 'Mira', avatar: 'tiger-face' })]
    render(<PlayersSection {...baseProps} players={players} onRemovePlayer={onRemovePlayer} />)

    expect(screen.getByText('Mira')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Mira' }))
    expect(onRemovePlayer).toHaveBeenCalledWith('p1')
  })

  it('shows validation error when draft name is invalid', () => {
    render(
      <PlayersSection
        {...baseProps}
        draftTouched={{ name: true }}
        draftErrors={{ name: 'Name required' }}
      />,
    )
    expect(screen.getByText('Name required')).toBeInTheDocument()
  })
})
