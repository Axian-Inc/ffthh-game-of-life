import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import PlayerForm from './PlayerForm.jsx';

const fillValidForm = async (user) => {
  await user.type(screen.getByLabelText(/nickname/i), 'Alex');
  await user.type(screen.getByLabelText(/email/i), 'alex@example.com');
};

test('validates nickname requirements', async () => {
  const user = userEvent.setup();
  render(<PlayerForm onAddPlayer={() => {}} />);

  await act(async () => {
    await user.type(screen.getByLabelText(/nickname/i), 'A');
  });
  await act(async () => {
    await user.tab();
  });

  expect(screen.getByText(/2-20 characters/i)).toBeInTheDocument();
});

test('validates email format', async () => {
  const user = userEvent.setup();
  render(<PlayerForm onAddPlayer={() => {}} />);

  await act(async () => {
    await user.type(screen.getByLabelText(/email/i), 'invalid');
  });
  await act(async () => {
    await user.tab();
  });

  expect(screen.getByText(/valid email/i)).toBeInTheDocument();
});

test('submit button disabled when invalid', () => {
  render(<PlayerForm onAddPlayer={() => {}} />);
  expect(screen.getByRole('button', { name: /add player/i })).toBeDisabled();
});

test('onAddPlayer called with player data', async () => {
  const user = userEvent.setup();
  const handleAdd = jest.fn();
  render(<PlayerForm onAddPlayer={handleAdd} />);

  await act(async () => {
    await fillValidForm(user);
  });
  await act(async () => {
    await user.click(screen.getByRole('button', { name: /add player/i }));
  });

  expect(handleAdd).toHaveBeenCalledWith(
    expect.objectContaining({
      nickname: 'Alex',
      email: 'alex@example.com',
    })
  );
});

test('form clears after submission', async () => {
  const user = userEvent.setup();
  render(<PlayerForm onAddPlayer={() => {}} />);

  await act(async () => {
    await fillValidForm(user);
  });
  await act(async () => {
    await user.click(screen.getByRole('button', { name: /add player/i }));
  });

  expect(screen.getByLabelText(/nickname/i)).toHaveValue('');
  expect(screen.getByLabelText(/email/i)).toHaveValue('');
});
