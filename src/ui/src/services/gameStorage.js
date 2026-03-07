import { seedGames } from '../data/seedGames'

const STORAGE_KEY = 'ffthh-game-of-life.games'
const DRAFT_ID_PREFIX = 'draft-'

const isDraftId = (value) => String(value || '').startsWith(DRAFT_ID_PREFIX)

const createDraftId = () => `${DRAFT_ID_PREFIX}${generateId()}`

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

const createDraftGame = (game) =>
  normalizeGame({
    ...game,
    id: game?.id && isDraftId(game.id) ? String(game.id) : createDraftId(),
    draft: true,
  })

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
  createGame: async (game) => createDraftGame(game),
  deleteGame: async (gameId) => {
    const games = loadLocalGames()
    const updated = games.filter((game) => game.id !== String(gameId))
    saveLocalGames(updated)
  },
  updateGame: async (gameId, updates) => {
    const normalizedId = String(gameId)
    const games = loadLocalGames()
    if (isDraftId(normalizedId)) {
      const createdGame = normalizeGame({
        ...updates,
        id: generateId(),
      })
      const updated = [createdGame, ...games]
      saveLocalGames(updated)
      return createdGame
    }

    const existing = games.find((game) => game.id === normalizedId)
    if (!existing) {
      throw new Error('Game not found')
    }
    const merged = normalizeGame({
      ...existing,
      ...updates,
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
  createGame: async (game) => createDraftGame(game),
  deleteGame: async (gameId) => {
    await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}`, { method: 'DELETE' })
  },
  updateGame: async (gameId, updates) => {
    if (isDraftId(gameId)) {
      const data = await fetchJson(`${baseUrl}/games`, {
        method: 'POST',
        body: JSON.stringify({ game: updates }),
      })
      return data?.game ? normalizeGame(data.game) : normalizeGame({ ...updates, id: generateId() })
    }

    const data = await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}`, {
      method: 'PUT',
      body: JSON.stringify({ game: updates }),
    })
    return data?.game ? normalizeGame(data.game) : normalizeGame({ ...updates, id: String(gameId) })
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
