import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'

const STORAGE_KEY = 'ffthh-game-of-life.games'

const getStoredGames = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')

describe('setup flow persistence contract', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('persists a new game only after the final start action and keeps both players', async () => {
    const user = userEvent.setup()
    render(<App />)

    const initialCount = getStoredGames().length

    await user.click(screen.getByRole('button', { name: 'New Game' }))
    await user.type(screen.getByLabelText('Game Name'), 'Draft Contract')

    await user.type(screen.getByLabelText('Player nickname'), 'Alex')
    await user.click(screen.getByRole('button', { name: 'Add Player' }))

    expect(screen.getByRole('button', { name: /Start Game with 1 Player/i })).toBeDisabled()

    await user.clear(screen.getByLabelText('Player nickname'))
    await user.type(screen.getByLabelText('Player nickname'), 'Bailey')
    await user.click(screen.getByRole('button', { name: 'Add Player' }))

    await user.click(screen.getByRole('button', { name: /Start Game with 2 Players/i }))

    expect(getStoredGames()).toHaveLength(initialCount)
    expect(getStoredGames().some((game) => game.name === 'Draft Contract')).toBe(false)

    await user.click(screen.getByRole('button', { name: /Degree Track/i }))
    await user.click(screen.getByRole('button', { name: /Trades Track/i }))
    await user.click(screen.getByRole('button', { name: 'Start Game' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Draft Contract' })).toBeInTheDocument()
    })

    const savedGame = getStoredGames().find((game) => game.name === 'Draft Contract')
    expect(savedGame).toBeDefined()
    expect(savedGame.players).toHaveLength(2)
    expect(savedGame.players).toEqual([
      expect.objectContaining({
        name: 'Alex',
        cityId: '',
        educationTrackId: '',
        jobId: '',
        careerTrack: 'Degree Track',
      }),
      expect.objectContaining({
        name: 'Bailey',
        cityId: '',
        educationTrackId: '',
        jobId: '',
        careerTrack: 'Trades Track',
      }),
    ])

    await user.click(screen.getByRole('button', { name: 'Back to home' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Draft Contract' })).toBeInTheDocument()
    })
  })
})
