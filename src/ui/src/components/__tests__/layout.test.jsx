import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Hero from '../layout/Hero'
import PageShell from '../layout/PageShell'
import GameListSection from '../layout/GameListSection'

describe('Layout components', () => {
  it('Hero triggers create button', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(<Hero onCreate={onCreate} />)

    expect(screen.getByText('Game Hub')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'New Game' }))
    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  it('PageShell applies blur class', () => {
    const { container } = render(<PageShell isBlurred modals={null}>Content</PageShell>)
    expect(container.querySelector('.layout.is-blurred')).toBeInTheDocument()
  })

  it('GameListSection renders header and count', () => {
    render(
      <GameListSection count={2} isLoading={false}>
        <div>Games</div>
      </GameListSection>,
    )
    expect(screen.getByText('Your Games')).toBeInTheDocument()
    expect(screen.getByLabelText('2 games')).toBeInTheDocument()
  })
})
