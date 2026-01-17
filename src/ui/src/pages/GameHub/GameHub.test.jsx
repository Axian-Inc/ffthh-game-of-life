import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import GameHub from './GameHub.jsx';

const games = [
  {
    id: '1',
    name: 'Stored Game',
    players: [],
    lastActive: '2025-01-01T10:00:00Z',
    status: 'active',
  },
];

beforeEach(() => {
  window.localStorage.clear();
});

test('renders header, new game button, and game list', () => {
  render(<GameHub />);
  expect(screen.getByRole('heading', { name: /game hub/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument();
  expect(screen.getByText(/your games/i)).toBeInTheDocument();
});

test('new game button opens modal', async () => {
  const user = userEvent.setup();
  render(<GameHub />);
  await act(async () => {
    await user.click(screen.getByRole('button', { name: /new game/i }));
  });
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('loads games from localStorage', () => {
  window.localStorage.setItem('gameHubGames', JSON.stringify(games));
  render(<GameHub />);
  expect(screen.getByText(/stored game/i)).toBeInTheDocument();
});
