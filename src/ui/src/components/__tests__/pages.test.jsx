import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PlayGamePage from '../pages/PlayGamePage'
import WelcomeToLifePage from '../pages/WelcomeToLifePage'
import { getLifeLessonSpotlight } from '../../data/lifeLessonSpotlights'
import { createGame } from '../../test/testUtils'

describe('Page components', () => {
  it('renders PlayGamePage with live player turn content', async () => {
    const user = userEvent.setup()
    const onBeginTurn = vi.fn()
    const onContinueToBrief = vi.fn()
    const onResetTurnPlan = vi.fn()
    const onEndTurn = vi.fn()
    const onRevealNextTurn = vi.fn()
    const onSeeHistory = vi.fn()
    const game = createGame({
      players: [
        {
          id: 'player-1',
          name: 'Ari',
          avatar: 'fox',
          cityId: 'suburbia',
          jobId: 'musician',
          physicalHealth: 72,
          mentalHealth: 70,
          stress: 28,
        },
        {
          id: 'player-2',
          name: 'Jo',
          avatar: 'bear',
          cityId: 'metro',
          jobId: 'software-engineer',
          physicalHealth: 69,
          mentalHealth: 68,
          stress: 33,
        },
      ],
      turnNumber: 3,
      activePlayerIndex: 1,
    })

    const { rerender } = render(
      <PlayGamePage
        game={game}
        onBeginTurn={onBeginTurn}
        onContinueToBrief={onContinueToBrief}
        onResetTurnPlan={onResetTurnPlan}
        onEndTurn={onEndTurn}
        onRevealNextTurn={onRevealNextTurn}
        onSeeHistory={onSeeHistory}
        turnPlan={{
          stage: 'brief',
          actionPoints: 3,
          remainingActionPoints: 3,
          selectedActions: [],
          curatedActions: [],
          issueActions: [],
          explanation: 'You have a few strong options this month.',
          brief: null,
        }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 3' })).toBeInTheDocument()
    expect(screen.getByText("Jo's Turn")).toBeInTheDocument()
    expect(screen.getByText('Ari')).toBeInTheDocument()
    expect(screen.getByText('Jo')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    const spotlight = getLifeLessonSpotlight({ player: game.players[1], turnNumber: 3 })

    expect(screen.getByText('Physical Health (69)')).toBeInTheDocument()
    expect(screen.getByLabelText('Life lesson spotlight')).toBeInTheDocument()
    expect(screen.getByText(spotlight.title)).toBeInTheDocument()
    expect(screen.getByText(spotlight.prompt)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Plan This Month' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'See History' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Plan This Month' }))
    expect(onBeginTurn).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'See History' }))
    expect(onSeeHistory).toHaveBeenCalledTimes(1)

    rerender(
      <PlayGamePage
        game={game}
        onBeginTurn={onBeginTurn}
        onContinueToBrief={onContinueToBrief}
        onResetTurnPlan={onResetTurnPlan}
        onEndTurn={onEndTurn}
        onRevealNextTurn={onRevealNextTurn}
        onSeeHistory={onSeeHistory}
        turnPlan={{
          stage: 'action',
          actionPoints: 3,
          remainingActionPoints: 2,
          selectedActions: ['workout'],
          curatedActions: [
            {
              id: 'workout',
              label: 'Workout',
              apCost: 1,
              roleTag: 'Repair',
              riskTag: 'Low Risk',
              promise: 'Improve your health and lower stress.',
              previewText: 'Likely health gain.',
              futureHint: 'You might be sore next month.',
            },
          ],
          issueActions: [],
          explanation: 'You have a few strong options this month.',
          brief: null,
        }}
      />,
    )

    expect(screen.getByRole('button', { name: 'End Turn (1 actions)' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /End Turn/ }))
    expect(onEndTurn).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Re-read Brief' }))
    expect(onResetTurnPlan).toHaveBeenCalledTimes(1)

    rerender(
      <PlayGamePage
        game={game}
        onBeginTurn={onBeginTurn}
        onContinueToBrief={onContinueToBrief}
        onResetTurnPlan={onResetTurnPlan}
        onEndTurn={onEndTurn}
        onRevealNextTurn={onRevealNextTurn}
        onSeeHistory={onSeeHistory}
        turnPlan={{
          stage: 'handoff',
          actionPoints: 3,
          remainingActionPoints: 3,
          selectedActions: [],
          curatedActions: [],
          issueActions: [],
          explanation: '',
          brief: null,
          reveal: {
            turnNumber: 4,
            playerName: 'Jo',
            monthHeadline: 'Your finances moved in the right direction last month.',
            topDeltaCards: [],
            callouts: [],
            revealedConsequences: [],
          },
        }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Reveal Next Month' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reveal Next Month' }))
    expect(onRevealNextTurn).toHaveBeenCalledTimes(1)

    rerender(
      <PlayGamePage
        game={game}
        onBeginTurn={onBeginTurn}
        onContinueToBrief={onContinueToBrief}
        onResetTurnPlan={onResetTurnPlan}
        onEndTurn={onEndTurn}
        onRevealNextTurn={onRevealNextTurn}
        onSeeHistory={onSeeHistory}
        turnPlan={{
          stage: 'turn_reveal',
          actionPoints: 3,
          remainingActionPoints: 3,
          selectedActions: [],
          curatedActions: [],
          issueActions: [],
          explanation: '',
          brief: null,
          reveal: {
            turnNumber: 4,
            playerName: 'Jo',
            monthHeadline: 'Your finances moved in the right direction last month.',
            topDeltaCards: [{ key: 'netWorth', label: 'Net Worth', type: 'currency', value: 1200 }],
            callouts: ['Your debt payment reduced future pressure.'],
            revealedConsequences: [],
          },
        }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Continue to Brief' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue to Brief' }))
    expect(onContinueToBrief).toHaveBeenCalledTimes(1)
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
