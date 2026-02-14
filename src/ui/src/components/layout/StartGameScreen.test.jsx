import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import StartGameScreen from './StartGameScreen'

const buildGame = () => ({
  id: 1,
  name: 'Career Setup',
  players: [
    { id: 1, name: 'Alex', avatar: 'A' },
    { id: 2, name: 'Sam', avatar: 'S' },
  ],
})

describe('StartGameScreen', () => {
  test('start button enables only after all selections', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<StartGameScreen game={buildGame()} onStart={onStart} onBack={vi.fn()} />)

    const startButton = screen.getByRole('button', { name: 'Start Game' })
    expect(startButton).toBeDisabled()

    const rows = document.querySelectorAll('.career-row')
    await user.click(rows[0].querySelector('[data-test-id="career-option"][data-career="college"]'))
    expect(startButton).toBeDisabled()

    await user.click(rows[1].querySelector('[data-test-id="career-option"][data-career="trades"]'))
    expect(startButton).toBeEnabled()

    await user.click(startButton)
    expect(onStart).toHaveBeenCalled()
  })

  test('deselecting a career disables the button', async () => {
    const user = userEvent.setup()
    render(<StartGameScreen game={buildGame()} onStart={vi.fn()} onBack={vi.fn()} />)

    const startButton = screen.getByRole('button', { name: 'Start Game' })
    const rows = document.querySelectorAll('.career-row')
    const alexCollege = rows[0].querySelector('[data-test-id="career-option"][data-career="college"]')
    const samTrades = rows[1].querySelector('[data-test-id="career-option"][data-career="trades"]')

    await user.click(alexCollege)
    await user.click(samTrades)
    expect(startButton).toBeEnabled()

    await user.click(alexCollege)
    expect(startButton).toBeDisabled()
  })

  test('shows saving and error states', () => {
    render(
      <StartGameScreen
        game={buildGame()}
        onStart={vi.fn()}
        onBack={vi.fn()}
        isStarting
        error="Unable to save"
      />,
    )

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
    expect(screen.getByText('Unable to save')).toBeInTheDocument()
  })
})
