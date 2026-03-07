import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PlayGamePage from '../pages/PlayGamePage'
import WelcomeToLifePage from '../pages/WelcomeToLifePage'
import { createGame } from '../../test/testUtils'

describe('Page components', () => {
  it('renders the welcome page and returns home', async () => {
    const user = userEvent.setup()
    const onHome = vi.fn()

    render(<PlayGamePage game={createGame({ name: 'Choices Matter' })} onHome={onHome} />)

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
})
