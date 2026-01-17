import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameHub from './GameHub.jsx';
import useGames from '../../hooks/useGames.js';
import useToast from '../../hooks/useToast.js';

jest.mock('../../hooks/useGames.js');
jest.mock('../../hooks/useToast.js');

jest.mock('../../components/GameList/GameList.jsx', () => ({
  __esModule: true,
  default: ({ games, onResumeGame, onDeleteGame }) => (
    <div>
      <div data-testid="game-list-count">{games.length}</div>
      {games[0] && (
        <>
          <button type="button" onClick={() => onResumeGame(games[0])}>
            Resume First
          </button>
          <button type="button" onClick={() => onDeleteGame(games[0])}>
            Delete First
          </button>
        </>
      )}
    </div>
  ),
}));

jest.mock('../../components/NewGameForm/NewGameForm.jsx', () => ({
  __esModule: true,
  default: ({ onCreateGame, onCancel }) => (
    <div>
      <button
        type="button"
        onClick={() => onCreateGame({ name: 'Mock Game', players: [] })}
      >
        Create Mock Game
      </button>
      <button type="button" onClick={onCancel}>
        Cancel Mock
      </button>
    </div>
  ),
}));

jest.mock('../../components/ConfirmDialog/ConfirmDialog.jsx', () => ({
  __esModule: true,
  default: ({ isOpen, onConfirm, onCancel }) =>
    isOpen ? (
      <div>
        <button type="button" onClick={onConfirm}>
          Confirm Delete
        </button>
        <button type="button" onClick={onCancel}>
          Cancel Delete
        </button>
      </div>
    ) : null,
}));

jest.mock('../../components/Modal/Modal.jsx', () => ({
  __esModule: true,
  default: ({ isOpen, children }) => (isOpen ? <div role="dialog">{children}</div> : null),
}));

const baseGame = { id: '1', name: 'Mock', players: [] };

const mockUseGames = (overrides = {}) => {
  const value = {
    games: [baseGame],
    createGame: jest.fn(),
    deleteGame: jest.fn(),
    updateGame: jest.fn(),
    loading: false,
    error: null,
    ...overrides,
  };

  useGames.mockReturnValue(value);
  return value;
};

const mockUseToast = (overrides = {}) => {
  const value = {
    toasts: [],
    addToast: jest.fn(),
    removeToast: jest.fn(),
    ...overrides,
  };

  useToast.mockReturnValue(value);
  return value;
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('shows loading message when games are loading', () => {
  mockUseGames({ loading: true, games: [] });
  mockUseToast();

  render(<GameHub />);

  expect(screen.getByText(/loading games/i)).toBeInTheDocument();
  expect(screen.queryByTestId('game-list-count')).not.toBeInTheDocument();
});

test('shows error toast when loading fails', () => {
  mockUseGames({ error: 'Load failed' });
  const toastState = mockUseToast();

  render(<GameHub />);

  expect(toastState.addToast).toHaveBeenCalledWith('Load failed', 'error');
});

test('creates a game and shows success toast', async () => {
  const user = userEvent.setup();
  const gamesState = mockUseGames();
  const toastState = mockUseToast();

  render(<GameHub />);

  await act(async () => {
    await user.click(screen.getByRole('button', { name: /new game/i }));
  });
  const createButton = await screen.findByRole('button', { name: /create mock game/i });
  await act(async () => {
    await user.click(createButton);
  });

  expect(gamesState.createGame).toHaveBeenCalledWith({ name: 'Mock Game', players: [] });
  expect(toastState.addToast).toHaveBeenCalledWith('Game created successfully!', 'success');
});

test('resumes a game from the list', async () => {
  const user = userEvent.setup();
  const gamesState = mockUseGames();
  mockUseToast();

  render(<GameHub />);

  await act(async () => {
    await user.click(screen.getByRole('button', { name: /resume first/i }));
  });

  expect(gamesState.updateGame).toHaveBeenCalledWith('1', { status: 'active' });
});

test('deletes a game after confirmation', async () => {
  const user = userEvent.setup();
  const gamesState = mockUseGames();
  const toastState = mockUseToast();

  render(<GameHub />);

  await act(async () => {
    await user.click(screen.getByRole('button', { name: /delete first/i }));
  });
  const confirmButton = await screen.findByRole('button', { name: /confirm delete/i });
  await act(async () => {
    await user.click(confirmButton);
  });

  expect(gamesState.deleteGame).toHaveBeenCalledWith('1');
  expect(toastState.addToast).toHaveBeenCalledWith('Game deleted', 'info');
});

test('dismisses toasts via removeToast', async () => {
  const user = userEvent.setup();
  mockUseGames();
  const toastState = mockUseToast({
    toasts: [{ id: 'toast-1', message: 'Hi', type: 'info' }],
  });

  render(<GameHub />);

  await act(async () => {
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
  });

  expect(toastState.removeToast).toHaveBeenCalledWith('toast-1');
});
