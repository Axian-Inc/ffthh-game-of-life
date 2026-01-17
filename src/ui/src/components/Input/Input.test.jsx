import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, act } from 'react';
import Input from './Input.jsx';

function ControlledInput(props) {
  const [value, setValue] = useState('');
  return <Input value={value} onChange={(event) => setValue(event.target.value)} {...props} />;
}

test('renders with placeholder', () => {
  render(
    <Input
      value=""
      onChange={() => {}}
      placeholder="Enter text"
    />
  );
  expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
});

test('updates value on change', async () => {
  const user = userEvent.setup();
  render(<ControlledInput placeholder="Type here" />);
  const input = screen.getByPlaceholderText(/type here/i);

  await act(async () => {
    await user.type(input, 'Game');
  });
  expect(input).toHaveValue('Game');
});

test('shows error state when error provided', () => {
  render(
    <Input
      value=""
      onChange={() => {}}
      error="Required"
      placeholder="Email"
    />
  );
  const input = screen.getByPlaceholderText(/email/i);
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('alert')).toHaveTextContent('Required');
});

test('label associates with input via htmlFor', () => {
  render(
    <Input
      value=""
      onChange={() => {}}
      label="Nickname"
      placeholder="Nickname"
    />
  );
  const input = screen.getByLabelText(/nickname/i);
  expect(input).toBeInTheDocument();
});

test('required attribute applied when specified', () => {
  render(
    <Input
      value=""
      onChange={() => {}}
      required
      placeholder="Required"
    />
  );
  expect(screen.getByPlaceholderText(/required/i)).toBeRequired();
});
