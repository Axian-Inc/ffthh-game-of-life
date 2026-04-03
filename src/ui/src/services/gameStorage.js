import { seedGames } from '../data/seedGames'
import { advanceTurnState, beginNextTurnState, normalizeGameState } from '../utils/turnEngine'

const STORAGE_KEY = 'ffthh-game-of-life.games'
export const GAME_STORAGE_KEY = STORAGE_KEY

const normalizeGame = (game) => normalizeGameState(game)

const normalizeGames = (games) => games.map((game) => normalizeGame(game))

const parseJson = (value) => {
  if (!value) {
    return null
  }
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `game-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

const getStorageMode = () => {
  const explicitMode = import.meta.env.VITE_STORAGE_MODE
  if (explicitMode === 'local') {
    return 'local'
  }
  if (explicitMode === 'cloud' || explicitMode === 'api') {
    return 'api'
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return 'api'
  }
  return 'local'
}

export const getCurrentStorageMode = () => getStorageMode()

const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) {
    return ''
  }
  return baseUrl.replace(/\/+$/, '')
}

const loadLocalGames = () => {
  const stored = parseJson(window.localStorage.getItem(STORAGE_KEY))
  if (Array.isArray(stored) && stored.length > 0) {
    return normalizeGames(stored)
  }
  const seeded = normalizeGames(seedGames())
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

export const readStoredGamesSnapshot = () => {
  if (typeof window === 'undefined') {
    return []
  }
  if (getStorageMode() !== 'local') {
    return []
  }
  return loadLocalGames()
}

export const getGameStorageDebugSnapshot = (fallbackGames = []) => {
  const storageMode = getStorageMode()
  const allGames =
    storageMode === 'local' ? readStoredGamesSnapshot() : normalizeGames(Array.isArray(fallbackGames) ? fallbackGames : [])

  return {
    storageMode,
    storageKey: STORAGE_KEY,
    allGames,
  }
}

const saveLocalGames = (games) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
}

const createLocalStorage = () => ({
  listGames: async () => loadLocalGames(),
  getGame: async (gameId) => {
    const normalizedId = String(gameId)
    const game = loadLocalGames().find((entry) => entry.id === normalizedId)
    if (!game) {
      throw new Error('Game not found')
    }
    return normalizeGame(game)
  },
  createGame: async (game) => {
    const games = loadLocalGames()
    const createdGame = normalizeGame({
      ...game,
      id: game.id ? String(game.id) : generateId(),
    })
    saveLocalGames([createdGame, ...games])
    return createdGame
  },
  deleteGame: async (gameId) => {
    const normalizedId = String(gameId)
    const games = loadLocalGames()
    const updated = games.filter((game) => game.id !== normalizedId)
    saveLocalGames(updated)
  },
  updateGame: async (gameId, updates) => {
    const normalizedId = String(gameId)
    const games = loadLocalGames()
    const existing = games.find((game) => game.id === normalizedId)

    if (existing) {
      const merged = normalizeGame({
        ...existing,
        ...updates,
        id: normalizedId,
      })
      const updated = games.map((game) => (game.id === normalizedId ? merged : game))
      saveLocalGames(updated)
      return merged
    }
    throw new Error('Game not found')
  },
  advanceTurn: async (gameId, payload) => {
    const normalizedId = String(gameId)
    const games = loadLocalGames()
    const existing = games.find((game) => game.id === normalizedId)

    if (!existing) {
      throw new Error('Game not found')
    }

    const result = advanceTurnState(existing, payload)
    const updated = games.map((game) => (game.id === normalizedId ? result.game : game))
    saveLocalGames(updated)
    return result
  },
  beginNextTurn: async (gameId) => {
    const normalizedId = String(gameId)
    const games = loadLocalGames()
    const existing = games.find((game) => game.id === normalizedId)

    if (!existing) {
      throw new Error('Game not found')
    }

    const updatedGame = beginNextTurnState(existing)
    const updated = games.map((game) => (game.id === normalizedId ? updatedGame : game))
    saveLocalGames(updated)
    return updatedGame
  },
})

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }
  if (response.status === 204) {
    return null
  }
  return response.json()
}

const createApiStorage = (baseUrl) => ({
  listGames: async () => {
    const data = await fetchJson(`${baseUrl}/games`)
    const games = Array.isArray(data?.games) ? data.games : []
    return normalizeGames(games)
  },
  getGame: async (gameId) => {
    const data = await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}`)
    if (!data?.game) {
      throw new Error('Game not found')
    }
    return normalizeGame(data.game)
  },
  createGame: async (game) => {
    const data = await fetchJson(`${baseUrl}/games`, {
      method: 'POST',
      body: JSON.stringify({ game }),
    })
    const created = data?.game ? normalizeGame(data.game) : normalizeGame({ ...game, id: generateId() })
    return created
  },
  deleteGame: async (gameId) => {
    await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}`, { method: 'DELETE' })
  },
  updateGame: async (gameId, updates) => {
    const data = await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}`, {
      method: 'PUT',
      body: JSON.stringify({ game: updates }),
    })
    return data?.game ? normalizeGame(data.game) : normalizeGame({ ...updates, id: String(gameId) })
  },
  advanceTurn: async (gameId, payload) => {
    const data = await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}/turns/advance`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return {
      game: normalizeGame(data?.game),
      turnResolution: data?.turnResolution ?? null,
    }
  },
  beginNextTurn: async (gameId, game) => {
    const nextGame = beginNextTurnState(game)
    const data = await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}`, {
      method: 'PUT',
      body: JSON.stringify({ game: nextGame }),
    })
    return data?.game ? normalizeGame(data.game) : nextGame
  },
})

export const createGameStorage = () => {
  const mode = getStorageMode()
  if (mode === 'api') {
    const baseUrl = getApiBaseUrl()
    if (!baseUrl) {
      return createLocalStorage()
    }
    return createApiStorage(baseUrl)
  }
  return createLocalStorage()
}
