import { renderHook, act, waitFor } from '@testing-library/react';
import useGames from './useGames.js';

const STORAGE_KEY = 'gameHubGames';

beforeEach(() => {
  window.localStorage.clear();
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
