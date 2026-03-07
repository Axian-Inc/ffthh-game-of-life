import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, vi } from 'vitest'
import App from '../../App'
import StartNewGamePage from '../pages/StartNewGamePage'
import PlayGamePage from '../pages/PlayGamePage'
import WelcomeToLifePage from '../pages/WelcomeToLifePage'
import { GAME_STORAGE_KEY } from '../../services/gameStorage'
import { createGame, createPlayer } from '../../test/testUtils'

afterEach(() => {
  window.localStorage.clear()
  window.history.replaceState({}, '', '/')
})

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

  it('renders PlayGamePage as welcome and handles navigation', async () => {
    const user = userEvent.setup()
    const onHome = vi.fn()

    render(<PlayGamePage game={createGame({ name: 'Play It' })} onHome={onHome} />)

    expect(screen.getByText('Welcome to Life!')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))

    expect(onHome).toHaveBeenCalledTimes(1)
  })

  it('renders WelcomeToLifePage content sections in order with quote block', () => {
    const { container } = render(<WelcomeToLifePage game={createGame({ name: 'Career Quest' })} onBegin={vi.fn()} />)

    expect(screen.getByText('Career Quest')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Welcome to Life!' })).toBeInTheDocument()

    const sectionHeadings = within(container).getAllByRole('heading', { level: 3 })
    expect(sectionHeadings.map((heading) => heading.textContent)).toEqual([
      'Start with purpose',
      'Build your path',
      'Play your story',
    ])

    expect(screen.getByText(/Life is what happens between your plans/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Let's Begin!" })).toBeInTheDocument()
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

  it('routes lifecycle.phase=started to welcome screen instead of setup wizard', async () => {
    const game = createGame({
      id: 'started-1',
      name: 'Started Session',
      lifecycle: { phase: 'started' },
      players: [createPlayer({ id: 'p1', name: 'Riley', careerTrack: '' })],
      resumable: true,
    })
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([game]))
    window.history.replaceState({}, '', `/games/${game.id}/careers`)

    render(<App />)

    expect(await screen.findByRole('heading', { level: 2, name: 'Welcome to Life!' })).toBeInTheDocument()
    expect(screen.getByText('Started Session')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'New Game Setup' })).not.toBeInTheDocument()
  })
})
