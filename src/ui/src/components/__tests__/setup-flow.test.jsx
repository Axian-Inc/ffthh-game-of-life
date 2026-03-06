import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import NewGameWizard from '../forms/NewGameWizard'

describe('NewGameWizard', () => {
  const buildProps = (overrides = {}) => ({
    players: [],
    draftPlayer: { name: '', avatar: 'rocket' },
    onDraftNameChange: vi.fn(),
    onAddPlayer: vi.fn(),
    onSubmit: vi.fn(),
    onGameNameChange: vi.fn(),
    onClose: vi.fn(),
    createError: '',
    isCreating: false,
    ...overrides,
  })

  it('keeps Next disabled on step 1 until the player name is non-empty after trimming', async () => {
    const user = userEvent.setup()
    render(<NewGameWizard {...buildProps()} />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).toBeDisabled()

    await user.type(screen.getByLabelText('Player Name:'), '   Alex')
    expect(nextButton).toBeEnabled()
  })

  it('preserves prior selections when navigating back', async () => {
    const user = userEvent.setup()
    render(<NewGameWizard {...buildProps()} />)

    await user.type(screen.getByLabelText('Player Name:'), 'Alex')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: /Tonopah, NV/i }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: /Self-Taught Track/i }))
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('button', { name: /Tonopah, NV/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows summary rows and enables Start Game only with two configured players', async () => {
    const user = userEvent.setup()
    const onAddPlayer = vi.fn()
    const onSubmit = vi.fn()
    render(<NewGameWizard {...buildProps({ onAddPlayer, onSubmit })} />)

    const finishPlayer = async (name) => {
      await user.clear(screen.getByLabelText('Player Name:'))
      await user.type(screen.getByLabelText('Player Name:'), name)
      await user.click(screen.getByRole('button', { name: 'Next' }))
      await user.click(screen.getByRole('button', { name: 'Next' }))
      await user.click(screen.getByRole('button', { name: /Trades Track/i }))
      await user.click(screen.getByRole('button', { name: 'Next' }))
      await user.click(screen.getByRole('button', { name: /Electrician/i }))
      await user.click(screen.getByRole('button', { name: 'Next' }))
    }

    await finishPlayer('Alex')
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()
    expect(screen.getByText('Alex')).toBeInTheDocument()
    expect(onAddPlayer).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: '+ New Player' }))
    await finishPlayer('Blair')
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Start Game' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onAddPlayer).toHaveBeenCalledTimes(2)
  })
})
