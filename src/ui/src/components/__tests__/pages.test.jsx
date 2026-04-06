import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PlayGamePage from '../pages/PlayGamePage'
import TakeTurnPage from '../pages/TakeTurnPage'
import TurnSummaryPage from '../pages/TurnSummaryPage'
import WelcomeToLifePage from '../pages/WelcomeToLifePage'
import { createGame } from '../../test/testUtils'
import { initializeGameForPlay, resolveTurn } from '../../services/gameplay'

describe('Page components', () => {
  it('renders PlayGamePage and handles navigation', async () => {
    const user = userEvent.setup()
    const onHome = vi.fn()

    render(<PlayGamePage game={createGame({ name: 'Play It' })} onHome={onHome} />)

    expect(screen.getByText('Play Game')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back to home' }))

    expect(onHome).toHaveBeenCalledTimes(1)
  })

  it('renders WelcomeToLifePage and handles begin navigation', async () => {
    const user = userEvent.setup()
    const onBegin = vi.fn()

    render(<WelcomeToLifePage game={createGame({ name: 'Choices Matter' })} onBegin={onBegin} />)

    expect(screen.getByRole('heading', { name: 'Welcome to Life!' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Let's Begin!" })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))
    expect(onBegin).toHaveBeenCalledTimes(1)
  })

  it('renders TakeTurnPage and exposes turn actions', async () => {
    const user = userEvent.setup()
    const onCompleteTurn = vi.fn()
    const game = initializeGameForPlay(
      createGame({
        players: [
          {
            id: 'player-1',
            name: 'Ari',
            avatar: 'fox',
            cityId: 'suburbia',
            educationTrackId: 'degree',
            jobId: 'software-engineer',
          },
          {
            id: 'player-2',
            name: 'Jo',
            avatar: 'bear',
            cityId: 'small-town',
            educationTrackId: 'trades',
            jobId: 'electrician',
          },
        ],
        playState: { view: 'turn', activePlayerIndex: 0, monthIndex: 1, turnNumber: 1 },
      }),
    )

    render(<TakeTurnPage game={game} onCompleteTurn={onCompleteTurn} onHome={vi.fn()} />)

    expect(screen.getByRole('heading', { name: /Ari's turn/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Choose Job Training/i }))

    expect(onCompleteTurn).toHaveBeenCalledWith('job-training')
  })

  it('renders TurnSummaryPage and continues to the next player', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    const startedGame = initializeGameForPlay(
      createGame({
        players: [
          {
            id: 'player-1',
            name: 'Ari',
            avatar: 'fox',
            cityId: 'suburbia',
            educationTrackId: 'degree',
            jobId: 'software-engineer',
          },
          {
            id: 'player-2',
            name: 'Jo',
            avatar: 'bear',
            cityId: 'small-town',
            educationTrackId: 'trades',
            jobId: 'electrician',
          },
        ],
      }),
    )
    const resolvedGame = resolveTurn({ ...startedGame, playState: { ...startedGame.playState, view: 'turn' } }, 'debt-paydown')

    render(<TurnSummaryPage game={resolvedGame} onContinue={onContinue} onHome={vi.fn()} />)

    expect(screen.getByRole('heading', { name: /Ari finished Month 1/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Continue to Jo/i }))

    expect(onContinue).toHaveBeenCalledTimes(1)
  })
})
