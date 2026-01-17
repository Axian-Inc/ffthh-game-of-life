import { useCallback, useEffect, useMemo, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage.js';

const STORAGE_KEY = 'gameHubGames';

const createId = () => {
  if (globalThis.crypto && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeGames = (data) => {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter((game) => game && game.id && game.name);
};

const useGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const persist = useCallback((nextGames) => {
    const result = writeStorage(STORAGE_KEY, nextGames);
    if (!result.success) {
      setError(result.error);
    }
  }, []);

  useEffect(() => {
    const result = readStorage(STORAGE_KEY);
    if (result.error) {
      setError(result.error);
      setGames([]);
    } else {
      setGames(normalizeGames(result.data));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : [];
        setGames(normalizeGames(parsed));
      } catch (err) {
        setError('Invalid storage data');
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const createGame = useCallback(
    (game) => {
      const now = new Date().toISOString();
      const nextGame = {
        id: createId(),
        name: game.name,
        players: game.players || [],
        status: game.status || 'active',
        createdAt: now,
        lastActive: now,
      };
      setGames((prev) => {
        const nextGames = [nextGame, ...prev];
        persist(nextGames);
        return nextGames;
      });
    },
    [persist]
  );

  const deleteGame = useCallback(
    (id) => {
      setGames((prev) => {
        const nextGames = prev.filter((game) => game.id !== id);
        persist(nextGames);
        return nextGames;
      });
    },
    [persist]
  );

  const updateGame = useCallback(
    (id, updates) => {
      setGames((prev) => {
        const nextGames = prev.map((game) =>
          game.id === id
            ? {
                ...game,
                ...updates,
                lastActive: new Date().toISOString(),
              }
            : game
        );
        persist(nextGames);
        return nextGames;
      });
    },
    [persist]
  );

  return useMemo(
    () => ({
      games,
      createGame,
      deleteGame,
      updateGame,
      loading,
      error,
    }),
    [games, createGame, deleteGame, updateGame, loading, error]
  );
};

export default useGames;
