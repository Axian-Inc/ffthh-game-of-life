import { render, screen } from '@testing-library/react';
import GameList from './GameList.jsx';

const games = [
  {
    id: '1',
    name: 'Older',
    players: [],
    lastActive: '2025-01-01T10:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    name: 'Newer',
    players: [],
    lastActive: '2025-02-01T10:00:00Z',
    status: 'active',
  },
];

test('renders all games', () => {
  render(<GameList games={games} onResumeGame={() => {}} onDeleteGame={() => {}} />);
  expect(screen.getByText(/older/i)).toBeInTheDocument();
  expect(screen.getByText(/newer/i)).toBeInTheDocument();
});

test('shows correct game count', () => {
  render(<GameList games={games} onResumeGame={() => {}} onDeleteGame={() => {}} />);
  expect(screen.getByText('2')).toBeInTheDocument();
});

test('shows empty state when no games', () => {
  render(<GameList games={[]} onResumeGame={() => {}} onDeleteGame={() => {}} />);
  expect(screen.getByText(/no games yet/i)).toBeInTheDocument();
});

test('games sorted correctly by lastActive', () => {
  const { container } = render(
    <GameList games={games} onResumeGame={() => {}} onDeleteGame={() => {}} />
  );
  const cards = Array.from(container.querySelectorAll('article'));
  expect(cards[0]).toHaveTextContent('Newer');
  expect(cards[1]).toHaveTextContent('Older');
});

test('grid layout responsive class exists', () => {
  const { container } = render(
    <GameList games={games} onResumeGame={() => {}} onDeleteGame={() => {}} />
  );
  expect(container.querySelector('[class*=\"grid\"]')).toBeInTheDocument();
});
