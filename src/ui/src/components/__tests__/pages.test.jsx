import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PlayGamePage from '../pages/PlayGamePage'
import WelcomeToLifePage from '../pages/WelcomeToLifePage'
import { createGame } from '../../test/testUtils'

describe('Page components', () => {
  it('renders PlayGamePage placeholder turn content', async () => {
    const user = userEvent.setup()
    const onChooseAction = vi.fn()

    render(<PlayGamePage game={createGame({ name: 'Play It' })} onChooseAction={onChooseAction} />)

    expect(screen.getByRole('heading', { name: 'Modern Game of Life - Turn 10' })).toBeInTheDocument()
    expect(screen.getByText("Jack's Turn")).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose Action' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Choose Action' }))
    expect(onChooseAction).toHaveBeenCalledTimes(1)
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
