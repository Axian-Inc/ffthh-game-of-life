import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import NewGameForm from './NewGameForm.jsx';

const addPlayer = async (user) => {
  await user.type(screen.getByLabelText(/nickname/i), 'Alex');
  await user.type(screen.getByLabelText(/email/i), 'alex@example.com');
  await user.click(screen.getByRole('button', { name: /add player/i }));
};

test('game name validates length', async () => {
  const user = userEvent.setup();
  render(<NewGameForm onCreateGame={() => {}} />);

  await act(async () => {
    await user.type(screen.getByLabelText(/game name/i), 'Hi');
  });
  await act(async () => {
    await user.tab();
  });

  expect(screen.getByText(/3-50 characters/i)).toBeInTheDocument();
});

test('players can be added and removed', async () => {
  const user = userEvent.setup();
  render(<NewGameForm onCreateGame={() => {}} />);

  await act(async () => {
    await addPlayer(user);
  });

  expect(screen.getByText(/players \(1\)/i)).toBeInTheDocument();
  await act(async () => {
    await user.click(screen.getByRole('button', { name: /remove alex/i }));
  });
  expect(screen.getByText(/players \(0\)/i)).toBeInTheDocument();
});

test('start button disabled with 0 players', () => {
  render(<NewGameForm onCreateGame={() => {}} />);
  expect(screen.getByRole('button', { name: /start game/i })).toBeDisabled();
  expect(screen.getByText(/add at least one player/i)).toBeInTheDocument();
});

test('onCreateGame called with complete game data', async () => {
  const user = userEvent.setup();
  const handleCreate = jest.fn();
  render(<NewGameForm onCreateGame={handleCreate} />);

  await act(async () => {
    await user.type(screen.getByLabelText(/game name/i), 'Family Night');
  });
  await act(async () => {
    await addPlayer(user);
  });
  await waitFor(() => expect(screen.getByText(/players \(1\)/i)).toBeInTheDocument());
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /start game/i })).toBeEnabled()
  );
  await act(async () => {
    await user.click(screen.getByRole('button', { name: /start game/i }));
  });

  expect(handleCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'Family Night',
      players: expect.any(Array),
    })
  );
});

test('form resets after submission', async () => {
  const user = userEvent.setup();
  render(<NewGameForm onCreateGame={() => {}} />);

  await act(async () => {
    await user.type(screen.getByLabelText(/game name/i), 'Family Night');
  });
  await act(async () => {
    await addPlayer(user);
  });
  await waitFor(() => expect(screen.getByText(/players \(1\)/i)).toBeInTheDocument());
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /start game/i })).toBeEnabled()
  );
  await act(async () => {
    await user.click(screen.getByRole('button', { name: /start game/i }));
  });

  expect(screen.getByLabelText(/game name/i)).toHaveValue('');
  expect(screen.getByText(/players \(0\)/i)).toBeInTheDocument();
});
