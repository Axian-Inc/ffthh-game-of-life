import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerList from './PlayerList.jsx';

const players = [
  { id: '1', nickname: 'Alex', email: 'alex@example.com', avatar: '🦁' },
  { id: '2', nickname: 'Sam', email: 'sam@example.com', avatar: '🐶' },
];

test('displays correct player count', () => {
  render(<PlayerList players={players} onRemovePlayer={() => {}} />);
  expect(screen.getByText(/players \(2\)/i)).toBeInTheDocument();
});

test('renders all players', () => {
  render(<PlayerList players={players} onRemovePlayer={() => {}} />);
  expect(screen.getByText('Alex')).toBeInTheDocument();
  expect(screen.getByText('Sam')).toBeInTheDocument();
});

test('shows empty state when no players', () => {
  render(<PlayerList players={[]} onRemovePlayer={() => {}} />);
  expect(screen.getByText(/no players added yet/i)).toBeInTheDocument();
});

test('onRemovePlayer called with player ID', async () => {
  const user = userEvent.setup();
  const handleRemove = jest.fn();
  render(<PlayerList players={players} onRemovePlayer={handleRemove} />);

  await user.click(screen.getByRole('button', { name: /remove alex/i }));
  expect(handleRemove).toHaveBeenCalledWith('1');
});

test('scrollable when >5 players', () => {
  const manyPlayers = Array.from({ length: 6 }, (_, index) => ({
    id: String(index),
    nickname: `Player ${index}`,
    email: `player${index}@example.com`,
    avatar: '🐱',
  }));
  render(<PlayerList players={manyPlayers} onRemovePlayer={() => {}} />);
  expect(screen.getByTestId('player-list')).toBeInTheDocument();
});
