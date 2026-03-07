import { seedGames } from '../data/seedGames'

const STORAGE_KEY = 'ffthh-game-of-life.games'

const normalizeGame = (game) => ({
  ...game,
  id: String(game.id),
})

const normalizeGames = (games) => games.map(normalizeGame)

const parseJson = (value) => {
  if (!value) {
    return null
  }
  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `game-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const sanitizeGameForSave = (game) => {
  const sanitizedPlayers = Array.isArray(game.players)
    ? game.players.map((player) => ({
        ...player,
        id: String(player.id),
      }))
    : []

  return {
    ...clone(game),
    players: sanitizedPlayers,
  }
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

const saveLocalGames = (games) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
}

const createLocalStorage = () => ({
  listGames: async () => loadLocalGames(),
  createGame: async (game) => {
    const games = loadLocalGames()
    const createdGame = normalizeGame({
      ...sanitizeGameForSave(game),
      id: game.id ? String(game.id) : generateId(),
    })
    const updated = [createdGame, ...games]
    saveLocalGames(updated)
    return createdGame
  },
  deleteGame: async (gameId) => {
    const games = loadLocalGames()
    const updated = games.filter((game) => game.id !== String(gameId))
    saveLocalGames(updated)
  },
  updateGame: async (gameId, updates) => {
    const normalizedId = String(gameId)
    const games = loadLocalGames()
    const existing = games.find((game) => game.id === normalizedId)

    if (!existing) {
      const created = normalizeGame({
        ...sanitizeGameForSave(updates),
        id: normalizedId,
      })
      const updated = [created, ...games]
      saveLocalGames(updated)
      return created
    }

    const merged = normalizeGame({
      ...existing,
      ...sanitizeGameForSave(updates),
      id: normalizedId,
    })
    const updated = games.map((game) => (game.id === normalizedId ? merged : game))
    saveLocalGames(updated)
    return merged
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
  createGame: async (game) => {
    const payload = sanitizeGameForSave(game)
    const data = await fetchJson(`${baseUrl}/games`, {
      method: 'POST',
      body: JSON.stringify({ game: payload }),
    })
    const created = data?.game ? normalizeGame(data.game) : normalizeGame({ ...payload, id: generateId() })
    return created
  },
  deleteGame: async (gameId) => {
    await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}`, { method: 'DELETE' })
  },
  updateGame: async (gameId, updates) => {
    const payload = sanitizeGameForSave(updates)
    const data = await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}`, {
      method: 'PUT',
      body: JSON.stringify({ game: payload }),
    })
    return data?.game ? normalizeGame(data.game) : normalizeGame({ ...payload, id: String(gameId) })
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
