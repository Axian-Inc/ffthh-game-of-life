import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import TurnHandoffPage from '../pages/TurnHandoffPage'
import TurnHubPage from '../pages/TurnHubPage'
import TurnSummaryPage from '../pages/TurnSummaryPage'
import WelcomeToLifePage from '../pages/WelcomeToLifePage'
import { createGame, createPlayer } from '../../test/testUtils'

describe('Page components', () => {
  it('renders TurnHubPage and handles turn actions', async () => {
    const user = userEvent.setup()
    const onTakeTurn = vi.fn()
    const onSaveAndExit = vi.fn()
    const onSelectAction = vi.fn()
    const game = createGame({
      availableActions: [
        {
          id: 'side-gig',
          label: 'Side Gig',
          description: 'Extra income now with some health tradeoff.',
          preview: {
            cash: [350, 550],
            netWorth: [350, 550],
            physicalHealth: [-2, -1],
            mentalHealth: [-2, -1],
            riskNotes: ['Can relieve cash pressure but increases fatigue.'],
          },
        },
      ],
    })

    render(
      <TurnHubPage
        game={game}
        activePlayer={game.players[0]}
        selectedActionId=""
        onSelectAction={onSelectAction}
        onTakeTurn={onTakeTurn}
        onSaveAndExit={onSaveAndExit}
      />,
    )

    expect(screen.getByRole('heading', { name: /Ari's Turn/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Side Gig/i }))
    expect(onSelectAction).toHaveBeenCalledWith('side-gig')

    await user.click(screen.getByRole('button', { name: 'Save and Exit' }))
    expect(onSaveAndExit).toHaveBeenCalledTimes(1)
  })

  it('renders TurnSummaryPage and handles continue', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    const turnResolution = {
      summary: {
        headline: 'Ari finished month 1 with Side Gig.',
        keyChanges: [{ metric: 'cash', delta: 400 }],
        intendedOutcomes: [{ source: 'Side Gig', description: 'The side gig brought in cash.' }],
        unintendedOutcomes: [{ source: 'Minor Illness', description: 'A minor illness cost money.' }],
        eventLabel: 'Minor Illness',
      },
    }

    render(<TurnSummaryPage turnResolution={turnResolution} onContinue={onContinue} />)

    expect(screen.getByRole('heading', { name: /Ari finished month 1/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('renders TurnHandoffPage and handles next turn', async () => {
    const user = userEvent.setup()
    const onStartNextTurn = vi.fn()
    const onExit = vi.fn()
    const game = createGame({
      status: 'handoff',
      players: [createPlayer({ name: 'Ari' }), createPlayer({ id: 'player-2', name: 'Jo' })],
      activePlayerIndex: 1,
      pendingHandoff: {
        fromPlayerId: 'player-1',
        toPlayerId: 'player-2',
        toPlayerName: 'Jo',
        month: 1,
        readyAt: Date.now(),
      },
    })

    render(
      <TurnHandoffPage game={game} onStartNextTurn={onStartNextTurn} onExit={onExit} />,
    )

    expect(screen.getByRole('heading', { name: 'Jo' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Start Next Turn' }))
    expect(onStartNextTurn).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Exit to Home' }))
    expect(onExit).toHaveBeenCalledTimes(1)
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
})
