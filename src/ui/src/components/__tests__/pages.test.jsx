import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import StartNewGamePage from '../pages/StartNewGamePage'
import PlayGamePage from '../pages/PlayGamePage'
import WelcomeToLifePage from '../pages/WelcomeToLifePage'
import { createGame, createPlayer } from '../../test/testUtils'

describe('Page components', () => {
  it('renders career options per player and starts game', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    const onBack = vi.fn()
    const game = createGame({
      name: 'Career Quest',
      players: [createPlayer({ id: 'p1', name: 'Riley', avatar: 'panda' })],
    })

    render(<StartNewGamePage game={game} onStart={onStart} onBack={onBack} />)

    expect(screen.getByText('Start New Game')).toBeInTheDocument()
    expect(screen.getByText('Riley')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(4)
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Degree Track/i }))
    await user.click(screen.getByRole('button', { name: 'Start Game' }))
    expect(onStart).toHaveBeenCalledTimes(1)
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        players: [expect.objectContaining({ id: 'p1', careerTrack: 'Degree Track' })],
      }),
    )
  })

  it('renders PlayGamePage as the welcome screen and handles navigation', async () => {
    const user = userEvent.setup()
    const onHome = vi.fn()

    render(<PlayGamePage game={createGame({ name: 'Play It' })} onHome={onHome} />)

    expect(screen.getByRole('heading', { name: 'Welcome to Life!' })).toBeInTheDocument()
    expect(screen.queryByText(/Game board coming soon/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))

    expect(onHome).toHaveBeenCalledTimes(1)
  })

  it('renders WelcomeToLifePage content blocks', () => {
    render(<WelcomeToLifePage game={createGame({ name: 'Choices Matter' })} onBegin={vi.fn()} />)

    expect(screen.getByText('A Month at a Time')).toBeInTheDocument()
    expect(screen.getByText('Choices Matter')).toBeInTheDocument()
    expect(screen.getByText('Life Happens')).toBeInTheDocument()
    expect(screen.getByText(/The best way to predict your future is to create it/i)).toBeInTheDocument()
  })

  it('resumes career selection from the next player without a choice', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    const game = createGame({
      name: 'Career Quest',
      players: [
        createPlayer({ id: 'p1', name: 'Riley', avatar: 'panda', careerTrack: 'Degree Track' }),
        createPlayer({ id: 'p2', name: 'Avery', avatar: 'fox' }),
      ],
    })

    render(<StartNewGamePage game={game} onStart={onStart} onBack={vi.fn()} />)

    expect(screen.getByText('Riley')).toBeInTheDocument()
    expect(screen.getByText('Avery')).toBeInTheDocument()
    expect(screen.getByText(/Career: Degree Track/)).toBeInTheDocument()
    expect(screen.getByText('Choosing now')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(4)
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Creator Track/i }))
    await user.click(screen.getByRole('button', { name: 'Start Game' }))

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        players: [
          expect.objectContaining({ id: 'p1', careerTrack: 'Degree Track' }),
          expect.objectContaining({ id: 'p2', careerTrack: 'Creator Track' }),
        ],
      }),
    )
  })
})
