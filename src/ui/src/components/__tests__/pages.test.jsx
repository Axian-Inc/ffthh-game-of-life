import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PlayGamePage from '../pages/PlayGamePage'
import WelcomeToLifePage from '../pages/WelcomeToLifePage'
import { createGame, createPlayer } from '../../test/testUtils'

describe('Page components', () => {
  it('renders PlayGamePage, resolves a turn, and advances to pass control', async () => {
    const user = userEvent.setup()
    const onHome = vi.fn()
    const onGameUpdate = vi.fn(async (nextGame) => nextGame)

    render(
      <PlayGamePage
        game={createGame({
          name: 'Play It',
          players: [
            createPlayer({ id: 'player-1', name: 'Ari', avatar: 'fox' }),
            createPlayer({ id: 'player-2', name: 'Mia', avatar: 'bear' }),
          ],
        })}
        onHome={onHome}
        onGameUpdate={onGameUpdate}
      />,
    )

    expect(screen.getByText('Take a Turn')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Review actions' }))
    await user.click(screen.getByRole('button', { name: /Take a side gig/i }))
    await user.click(screen.getByRole('button', { name: 'Take turn' }))

    expect(onGameUpdate).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('heading', { name: /Ari's month in review/i })).toBeInTheDocument()
    expect(screen.getByText(/Month 1\. Ari is in seat 1 of 2\./i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Pass device' }))
    expect(screen.getByRole('heading', { name: /Mia, you're up next\./i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Start next turn' }))
    expect(onGameUpdate).toHaveBeenCalledTimes(2)
    expect(onGameUpdate.mock.calls[1][0].phase).toBe('turn-start')
    expect(screen.getByRole('button', { name: 'Review actions' })).toBeInTheDocument()
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
})
