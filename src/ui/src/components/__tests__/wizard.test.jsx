import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import NewGameWizard from '../forms/NewGameWizard'

const buildPlayer = async (user, { nickname, avatar, city, track, career }) => {
  const nicknameInput = screen.getByRole('textbox', { name: 'Nickname' })
  await user.clear(nicknameInput)
  await user.type(nicknameInput, nickname)
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
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('prefills the game name and lets the user edit it', async () => {
    const user = userEvent.setup()
    render(<NewGameWizard onCancel={vi.fn()} onSubmit={vi.fn()} />)

    const gameNameInput = screen.getByRole('textbox', { name: 'Game name' })
    const nextButton = screen.getByRole('button', { name: /Next/i })
    expect(gameNameInput).toHaveValue('Family Game Night')
    expect(nextButton).toBeEnabled()

    await user.clear(gameNameInput)
    expect(nextButton).toBeDisabled()

    await user.type(gameNameInput, 'Road Trip Ruckus')
    expect(nextButton).toBeEnabled()
  })

  it('prefills player names, preserves edits, and uses the Education Track label', async () => {
    const user = userEvent.setup()
    render(<NewGameWizard onCancel={vi.fn()} onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Next/i }))

    const nicknameInput = screen.getByRole('textbox', { name: 'Nickname' })
    const nextButton = screen.getByRole('button', { name: /Next/i })
    expect(nicknameInput).toHaveValue('Avery')
    expect(nextButton).toBeDisabled()

    await user.clear(nicknameInput)
    await user.type(nicknameInput, 'Ted')
    expect(nextButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Fox' }))
    expect(nextButton).toBeEnabled()

    await user.click(nextButton)
    await user.click(screen.getByRole('button', { name: /Denver/i }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    expect(screen.getByRole('heading', { name: 'Education Track' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Self-Taught/i }))
    await user.click(screen.getByRole('button', { name: /Next/i }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('textbox', { name: 'Nickname' })).toHaveValue('Ted')
    await user.click(screen.getByRole('button', { name: /Next/i }))
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
    expect(screen.getByRole('textbox', { name: 'Nickname' })).toHaveValue('Nova')
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled()
  })

  it('submits the finished setup from summary', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<NewGameWizard onCancel={vi.fn()} onSubmit={onSubmit} />)

    const gameNameInput = screen.getByRole('textbox', { name: 'Game name' })
    await user.clear(gameNameInput)
    await user.type(gameNameInput, 'Weekend Plan')
    await user.click(screen.getByRole('button', { name: /Next/i }))

    await buildPlayer(user, {
      nickname: 'Ted',
      avatar: 'Fox',
      city: 'Denver',
      track: 'Self-Taught',
      career: 'Content Creator',
    })

    await user.click(screen.getByRole('button', { name: /Add Player/i }))

    await buildPlayer(user, {
      nickname: 'Mia',
      avatar: 'Bear',
      city: 'New York City',
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
