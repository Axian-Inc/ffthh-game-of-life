import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import IconButton from '../ui/IconButton'
import TextField from '../ui/TextField'
import SelectField from '../ui/SelectField'

describe('UI components', () => {
  it('renders PrimaryButton and handles clicks', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<PrimaryButton onClick={onClick}>Save</PrimaryButton>)

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders SecondaryButton', () => {
    render(<SecondaryButton>Cancel</SecondaryButton>)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('renders IconButton', () => {
    render(<IconButton aria-label="Close">x</IconButton>)
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('renders TextField with error', () => {
    render(<TextField id="name" label="Name" error="Required" />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('renders SelectField options', () => {
    render(
      <SelectField id="mode" label="Mode">
        <option value="one">One</option>
      </SelectField>,
    )
    expect(screen.getByLabelText('Mode')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'One' })).toBeInTheDocument()
  })
})
