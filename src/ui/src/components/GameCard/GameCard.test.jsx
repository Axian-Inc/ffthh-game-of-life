import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameCard from './GameCard.jsx';

const baseGame = {
  id: '1',
  name: 'Family Game Night',
  players: [
    { id: 'p1', avatar: '🦁' },
    { id: 'p2', avatar: '🐶' },
  ],
  lastActive: new Date('2025-01-10T09:50:00Z'),
  status: 'active',
};

test('renders game name', () => {
  render(<GameCard game={baseGame} onResume={() => {}} onDelete={() => {}} />);
  expect(screen.getByText(/family game night/i)).toBeInTheDocument();
});

test('displays correct player count', () => {
  render(<GameCard game={baseGame} onResume={() => {}} onDelete={() => {}} />);
  expect(screen.getByText(/2 players/i)).toBeInTheDocument();
});

test('shows formatted timestamp', () => {
  jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-10T10:00:00Z').getTime());
  render(<GameCard game={baseGame} onResume={() => {}} onDelete={() => {}} />);
  expect(screen.getByText(/10 minutes ago/i)).toBeInTheDocument();
  Date.now.mockRestore();
});

test('renders player avatars', () => {
  render(<GameCard game={baseGame} onResume={() => {}} onDelete={() => {}} />);
  expect(screen.getAllByLabelText(/avatar/i)).toHaveLength(2);
});

test('calls onResume when Resume clicked', async () => {
  const user = userEvent.setup();
  const handleResume = jest.fn();
  render(<GameCard game={baseGame} onResume={handleResume} onDelete={() => {}} />);
  await user.click(screen.getByRole('button', { name: /resume/i }));
  expect(handleResume).toHaveBeenCalledWith(baseGame);
});

test('calls onDelete when delete icon clicked', async () => {
  const user = userEvent.setup();
  const handleDelete = jest.fn();
  render(<GameCard game={baseGame} onResume={() => {}} onDelete={handleDelete} />);
  await user.click(screen.getByRole('button', { name: /delete game/i }));
  expect(handleDelete).toHaveBeenCalledWith(baseGame);
});

test('status badge shows correct text', () => {
  render(<GameCard game={baseGame} onResume={() => {}} onDelete={() => {}} />);
  expect(screen.getByText(/active/i)).toBeInTheDocument();
});
