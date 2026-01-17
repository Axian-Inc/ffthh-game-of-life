import { renderHook, act, waitFor } from '@testing-library/react';
import * as storage from '../utils/storage.js';
import useGames from './useGames.js';

const STORAGE_KEY = 'gameHubGames';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('createGame adds new game', async () => {
  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  act(() => {
    result.current.createGame({ name: 'Family', players: [] });
  });

  expect(result.current.games).toHaveLength(1);
});

test('deleteGame removes game', async () => {
  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  act(() => {
    result.current.createGame({ name: 'Family', players: [] });
  });
  const gameId = result.current.games[0].id;

  act(() => {
    result.current.deleteGame(gameId);
  });

  expect(result.current.games).toHaveLength(0);
});

test('updateGame modifies existing game', async () => {
  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  act(() => {
    result.current.createGame({ name: 'Family', players: [] });
  });
  const gameId = result.current.games[0].id;

  act(() => {
    result.current.updateGame(gameId, { name: 'Updated' });
  });

  expect(result.current.games[0].name).toBe('Updated');
});

test('games persist across reloads', async () => {
  const { result, unmount } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  act(() => {
    result.current.createGame({ name: 'Persisted', players: [] });
  });

  unmount();

  const { result: nextResult } = renderHook(() => useGames());
  await waitFor(() => expect(nextResult.current.loading).toBe(false));
  expect(nextResult.current.games[0].name).toBe('Persisted');
});

test('invalid data handled gracefully', async () => {
  window.localStorage.setItem(STORAGE_KEY, 'not-json');
  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.games).toHaveLength(0);
  expect(result.current.error).toBe('Invalid storage data');
});

test('filters invalid games from storage', async () => {
  const stored = [
    { id: '1', name: 'Valid', players: [] },
    { id: '', name: 'Missing id', players: [] },
    null,
  ];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.games).toHaveLength(1);
  expect(result.current.games[0].name).toBe('Valid');
});

test('createGame uses defaults when optional fields missing', async () => {
  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  act(() => {
    result.current.createGame({ name: 'Defaults', status: 'paused' });
  });

  expect(result.current.games[0].players).toEqual([]);
  expect(result.current.games[0].status).toBe('paused');
});

test('updateGame leaves other games unchanged', async () => {
  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  act(() => {
    result.current.createGame({ name: 'First', players: [] });
    result.current.createGame({ name: 'Second', players: [] });
  });

  const [latest, older] = result.current.games;

  act(() => {
    result.current.updateGame(latest.id, { name: 'Updated' });
  });

  const updated = result.current.games.find((game) => game.id === latest.id);
  const unchanged = result.current.games.find((game) => game.id === older.id);

  expect(updated.name).toBe('Updated');
  expect(unchanged.name).toBe(older.name);
});

test('handles storage events with updated data', async () => {
  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  const nextGames = [{ id: '99', name: 'Synced', players: [] }];

  act(() => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(nextGames),
      })
    );
  });

  expect(result.current.games).toHaveLength(1);
  expect(result.current.games[0].name).toBe('Synced');
});

test('ignores storage events for other keys', async () => {
  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  act(() => {
    result.current.createGame({ name: 'Keep', players: [] });
  });

  act(() => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'other-key',
        newValue: JSON.stringify([{ id: '5', name: 'Ignore', players: [] }]),
      })
    );
  });

  expect(result.current.games).toHaveLength(1);
  expect(result.current.games[0].name).toBe('Keep');
});

test('storage events clear games when newValue is null', async () => {
  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  act(() => {
    result.current.createGame({ name: 'Temp', players: [] });
  });

  act(() => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: null,
      })
    );
  });

  expect(result.current.games).toHaveLength(0);
});

test('storage events set error on invalid json', async () => {
  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  act(() => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: '{',
      })
    );
  });

  expect(result.current.error).toBe('Invalid storage data');
});

test('persists errors when storage write fails', async () => {
  jest.spyOn(storage, 'writeStorage').mockReturnValue({
    success: false,
    error: 'Storage unavailable',
  });

  const { result } = renderHook(() => useGames());
  await waitFor(() => expect(result.current.loading).toBe(false));

  act(() => {
    result.current.createGame({ name: 'Fail', players: [] });
  });

  expect(result.current.error).toBe('Storage unavailable');
});
