import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import GameCard from './GameCard'

const baseGame = {
  id: 1,
  name: 'Test Game',
  status: 'active',
  players: [{ name: 'Alex', avatar: 'A' }, { name: 'Sam', avatar: 'S' }],
  lastUpdated: 1700000000000,
  createdAt: 1700000000000,
}

const renderCard = (overrides = {}, handlers = {}) => {
  const game = { ...baseGame, ...overrides }
  const onResume = handlers.onResume || vi.fn()
  const onViewResults = handlers.onViewResults || vi.fn()
  const onDelete = handlers.onDelete || vi.fn()

  const utils = render(
    <GameCard
      game={game}
      now={1700000005000}
      isLoading={false}
      onResume={onResume}
      onViewResults={onViewResults}
      onDelete={onDelete}
      resumeError={handlers.resumeError}
      deleteError={handlers.deleteError}
      isNew={false}
    />,
  )

  return { ...utils, onResume, onViewResults, onDelete }
}

describe('GameCard', () => {
  test('renders metadata and handles resume clicks', async () => {
    const user = userEvent.setup()
    const { onResume } = renderCard()

    expect(screen.getByText('Test Game')).toBeInTheDocument()
    expect(screen.getByText('2 players')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Resume' }))
    expect(onResume).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
  })

  test('shows errors and disables paused actions', () => {
    renderCard(
      { status: 'paused' },
      {
        resumeError: 'Cannot resume.',
        deleteError: 'Delete failed.',
      },
    )

    expect(screen.getByText('Cannot resume.')).toBeInTheDocument()
    expect(screen.getByText('Delete failed.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resume' })).toBeDisabled()
  })

  test('renders view results for completed games', async () => {
    const user = userEvent.setup()
    const { onViewResults } = renderCard({ status: 'completed' })

    await user.click(screen.getByRole('button', { name: 'View results' }))
    expect(onViewResults).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
  })
})
