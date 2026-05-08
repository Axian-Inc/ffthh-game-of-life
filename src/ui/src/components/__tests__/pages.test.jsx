import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PlayGamePage from '../pages/PlayGamePage'
import WelcomeToLifePage from '../pages/WelcomeToLifePage'
import { createGame } from '../../test/testUtils'

describe('Page components', () => {
  it('renders PlayGamePage with live player turn content', async () => {
    const user = userEvent.setup()
    const onChooseAction = vi.fn()
    const onPass = vi.fn()
    const onSeeHistory = vi.fn()
    const game = createGame({
      players: [
        { id: 'player-1', name: 'Ari', avatar: 'fox' },
        { id: 'player-2', name: 'Jo', avatar: 'bear' },
      ],
      turnNumber: 3,
      activePlayerIndex: 1,
    })

    render(<PlayGamePage game={game} onChooseAction={onChooseAction} onPass={onPass} onSeeHistory={onSeeHistory} />)

    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 3' })).toBeInTheDocument()
    expect(screen.getByText("Jo's Turn")).toBeInTheDocument()
    expect(screen.getByText('Ari')).toBeInTheDocument()
    expect(screen.getByText('Jo')).toBeInTheDocument()
    expect(screen.getByText('Content Creator')).toBeInTheDocument()
    expect(screen.getAllByText('$7,500')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Choose Action' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pass' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'See History' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Choose Action' }))
    expect(onChooseAction).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Pass' }))
    expect(onPass).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'See History' }))
    expect(onSeeHistory).toHaveBeenCalledTimes(1)
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
