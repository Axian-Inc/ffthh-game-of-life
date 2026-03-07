import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PlayGamePage from '../pages/PlayGamePage'
import { createGame } from '../../test/testUtils'

describe('Page components', () => {
  it('renders the welcome page and returns home', async () => {
    const user = userEvent.setup()
    const onHome = vi.fn()

    render(<PlayGamePage game={createGame({ name: 'Choices Matter' })} onHome={onHome} />)

    expect(screen.getByRole('heading', { name: 'Welcome to Life!' })).toBeInTheDocument()
    expect(screen.getByText('Choices Matter is ready to begin.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: "Let's Begin!" }))
    expect(onHome).toHaveBeenCalledTimes(1)
  })
})
