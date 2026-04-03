import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import GameCardActions from '../games/GameCardActions'
import StatusPill from '../games/StatusPill'
import GameErrorState from '../games/GameErrorState'
import GameSkeletonCard from '../games/GameSkeletonCard'
import AvatarRow from '../games/AvatarRow'
import GameGrid from '../games/GameGrid'
import GameCountBadge from '../games/GameCountBadge'
import GameCard from '../games/GameCard'
import { createGame, createPlayer } from '../../test/testUtils'

describe('Game components', () => {
  it('renders GameCountBadge in loading state', () => {
    render(<GameCountBadge count={3} isLoading />)
    expect(screen.getByLabelText('Loading games')).toBeInTheDocument()
    expect(screen.getByText('...')).toBeInTheDocument()
  })

  it('renders StatusPill', () => {
    render(<StatusPill status="active" />)
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('renders AvatarRow with overflow', () => {
    const players = ['🧩', '⚡', '🌿', '🔥', '💫']
    render(<AvatarRow players={players} maxVisible={3} />)
    expect(screen.getByLabelText('5 players')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('GameCardActions triggers resume or results', async () => {
    const user = userEvent.setup()
    const onResume = vi.fn()
    const onViewResults = vi.fn()
    const onDelete = vi.fn()
    const game = createGame({ status: 'turn_ready' })

    render(
      <GameCardActions
        game={game}
        isLoading={false}
        onResume={onResume}
        onViewResults={onViewResults}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Resume' }))
    expect(onResume).toHaveBeenCalledWith(game)

    await user.click(screen.getByRole('button', { name: `Delete ${game.name}` }))
    expect(onDelete).toHaveBeenCalledWith(game)
  })

  it('GameCardActions triggers results for completed games', async () => {
    const user = userEvent.setup()
    const onResume = vi.fn()
    const onViewResults = vi.fn()
    const game = createGame({ status: 'completed' })

    render(
      <GameCardActions
        game={game}
        isLoading={false}
        onResume={onResume}
        onViewResults={onViewResults}
        onDelete={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'View results' }))
    expect(onViewResults).toHaveBeenCalledWith(game)
  })

  it('renders GameErrorState and retries', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<GameErrorState message="Failed" onRetry={onRetry} />)

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders GameSkeletonCard', () => {
    const { container } = render(<GameSkeletonCard />)
    expect(container.querySelector('.skeleton')).toBeInTheDocument()
  })

  it('renders GameCard with errors', () => {
    const game = createGame({
      players: [createPlayer({ name: 'Mira' })],
      status: 'handoff',
      lastUpdated: 0,
    })
    render(
      <GameCard
        game={game}
        now={0}
        isLoading={false}
        onResume={vi.fn()}
        onViewResults={vi.fn()}
        onDelete={vi.fn()}
        resumeError="Cannot resume"
        deleteError="Cannot delete"
      />,
    )

    expect(screen.getByText(game.name)).toBeInTheDocument()
    expect(screen.getByText('Cannot resume')).toBeInTheDocument()
    expect(screen.getByText('Cannot delete')).toBeInTheDocument()
  })

  it('renders GameGrid skeletons while loading', () => {
    render(
      <GameGrid
        games={[]}
        isLoading
        now={Date.now()}
        onResume={vi.fn()}
        onViewResults={vi.fn()}
        onDelete={vi.fn()}
        resumeErrors={{}}
        deleteErrors={{}}
        newGameId={null}
        newGameCardRef={null}
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })
})
