import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Hero from './Hero'

describe('Hero', () => {
  test('calls onCreate when New Game is clicked', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    const { container } = render(<Hero onCreate={onCreate} />)

    await user.click(screen.getByRole('button', { name: 'New Game' }))
    expect(onCreate).toHaveBeenCalled()

    expect(container.firstChild).toMatchSnapshot()
  })
})
