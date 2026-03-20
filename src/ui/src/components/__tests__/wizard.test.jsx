import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import NewGameWizard from '../forms/NewGameWizard'

const buildPlayer = async (user, { nickname, avatar, city, track, career }) => {
  await user.type(screen.getByRole('textbox', { name: 'Nickname' }), nickname)
  await user.click(screen.getByRole('button', { name: avatar }))
  await user.click(screen.getByRole('button', { name: /Next/i }))
  await user.click(screen.getByRole('button', { name: new RegExp(city, 'i') }))
  await user.click(screen.getByRole('button', { name: /Next/i }))
  await user.click(screen.getByRole('button', { name: new RegExp(track, 'i') }))
  await user.click(screen.getByRole('button', { name: /Next/i }))
  await user.click(screen.getByRole('button', { name: new RegExp(career, 'i') }))
  await user.click(screen.getByRole('button', { name: /Next/i }))
}

describe('NewGameWizard', () => {
  it('requires a game name before leaving the first step', async () => {
    const user = userEvent.setup()
    render(<NewGameWizard onCancel={vi.fn()} onSubmit={vi.fn()} />)

    const nextButton = screen.getByRole('button', { name: /Next/i })
    expect(nextButton).toBeDisabled()

    await user.type(screen.getByRole('textbox', { name: 'Game name' }), 'Family Game Night')
    expect(nextButton).toBeEnabled()
  })

  it('requires nickname, avatar, and two players before start', async () => {
    const user = userEvent.setup()
    render(<NewGameWizard onCancel={vi.fn()} onSubmit={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: 'Game name' }), 'Family Game Night')
    await user.click(screen.getByRole('button', { name: /Next/i }))

    const nextButton = screen.getByRole('button', { name: /Next/i })
    expect(nextButton).toBeDisabled()

    await user.type(screen.getByRole('textbox', { name: 'Nickname' }), 'Ted')
    expect(nextButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Fox' }))
    expect(nextButton).toBeEnabled()

    await user.click(nextButton)
    await user.click(screen.getByRole('button', { name: /Suburbia/i }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.click(screen.getByRole('button', { name: /Self-Taught/i }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.click(screen.getByRole('button', { name: /Content Creator/i }))
    await user.click(screen.getByRole('button', { name: /Next/i }))

    expect(screen.getByText('Game Name')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Family Game Night' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start Game/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Add Player/i }))
    expect(screen.getByRole('heading', { name: 'Player 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled()
  })

  it('submits the finished setup from summary', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<NewGameWizard onCancel={vi.fn()} onSubmit={onSubmit} />)

    await user.type(screen.getByRole('textbox', { name: 'Game name' }), 'Weekend Plan')
    await user.click(screen.getByRole('button', { name: /Next/i }))

    await buildPlayer(user, {
      nickname: 'Ted',
      avatar: 'Fox',
      city: 'Suburbia',
      track: 'Self-Taught',
      career: 'Content Creator',
    })

    await user.click(screen.getByRole('button', { name: /Add Player/i }))

    await buildPlayer(user, {
      nickname: 'Mia',
      avatar: 'Bear',
      city: 'Metro',
      track: 'Degree',
      career: 'Software Engineer',
    })

    await user.click(screen.getByRole('button', { name: /Start Game/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Weekend Plan',
      players: [
        expect.objectContaining({
          id: 'player-1',
          name: 'Ted',
          avatar: 'fox',
          cityId: 'suburbia',
          educationTrackId: 'self-taught',
          jobId: 'content-creator',
        }),
        expect.objectContaining({
          id: 'player-2',
          name: 'Mia',
          avatar: 'bear',
          cityId: 'metro',
          educationTrackId: 'degree',
          jobId: 'software-engineer',
        }),
      ],
    })
  })
})
