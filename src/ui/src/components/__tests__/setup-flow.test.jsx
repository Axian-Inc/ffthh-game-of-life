import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import NewGameWizard from '../forms/NewGameWizard'

const completeOnePlayer = async (user, name) => {
  await user.type(screen.getByLabelText('Player Name:'), name)
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: /San Francisco, CA/i }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: /Degree Track/i }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: /Software Engineer/i }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
}

describe('NewGameWizard setup flow', () => {
  it('requires a trimmed game name on Step 1', async () => {
    const user = userEvent.setup()
    render(<NewGameWizard onCancel={vi.fn()} onSubmit={vi.fn()} />)

    const next = screen.getByRole('button', { name: 'Next' })
    expect(next).toBeDisabled()

    await user.type(screen.getByLabelText('Game Name:'), '   Choices Matter   ')
    expect(next).toBeEnabled()
  })

  it('submits final payload with two configured players', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<NewGameWizard onCancel={vi.fn()} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Game Name:'), 'Wizard Test Game')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await completeOnePlayer(user, 'Alex')
    await user.click(screen.getByRole('button', { name: '+ New Player' }))
    await completeOnePlayer(user, 'Sam')

    const start = screen.getByRole('button', { name: 'Start Game' })
    expect(start).toBeEnabled()
    await user.click(start)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Wizard Test Game',
      players: [
        {
          id: 'player-1',
          name: 'Alex',
          avatar: 'octopus',
          cityId: 'san-francisco',
          educationTrackId: 'degree-track',
          jobId: 'software-engineer',
          careerTrack: 'Degree Track',
        },
        {
          id: 'player-2',
          name: 'Sam',
          avatar: 'snake',
          cityId: 'san-francisco',
          educationTrackId: 'degree-track',
          jobId: 'software-engineer',
          careerTrack: 'Degree Track',
        },
      ],
    })
  })
})
