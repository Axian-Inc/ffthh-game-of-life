import { seedGames } from '../data/seedGames'
import { normalizePlayers } from '../utils/playerState'
import { advanceLocalGameTurn } from './turnEvents'

const STORAGE_KEY = 'ffthh-game-of-life.games'
export const GAME_STORAGE_KEY = STORAGE_KEY

const normalizeTurnNumber = (turnNumber) => {
  if (!Number.isInteger(turnNumber) || turnNumber < 1) {
    return 1
  }
  return turnNumber
}

const normalizeActivePlayerIndex = (activePlayerIndex, playerCount) => {
  if (playerCount <= 0) {
    return 0
  }
  if (!Number.isInteger(activePlayerIndex) || activePlayerIndex < 0) {
    return 0
  }
  return activePlayerIndex % playerCount
}

const normalizeMoveHistory = (moveHistory) => {
  if (!Array.isArray(moveHistory)) {
    return []
  }

  return moveHistory.map((entry, index) => ({
    id: entry?.id != null ? String(entry.id) : `move-${index}`,
    playerId: entry?.playerId != null ? String(entry.playerId) : '',
    playerName: typeof entry?.playerName === 'string' && entry.playerName.trim() ? entry.playerName : 'Player',
    turnNumber: normalizeTurnNumber(entry?.turnNumber),
    actionType:
      typeof entry?.actionType === 'string' && entry.actionType.trim() ? entry.actionType : 'choose_action',
    actionLabel:
      typeof entry?.actionLabel === 'string' && entry.actionLabel.trim() ? entry.actionLabel : 'Choose Action',
    eventId: entry?.eventId != null ? String(entry.eventId) : null,
    createdAt: Number.isFinite(entry?.createdAt) ? entry.createdAt : 0,
  }))
}

const normalizeEvents = (events) => {
  if (!Array.isArray(events)) {
    return []
  }
  return events.map((event, index) => ({
    id: event?.id != null ? String(event.id) : `event-${index}`,
    turnKey: typeof event?.turnKey === 'string' ? event.turnKey : '',
    playerId: event?.playerId != null ? String(event.playerId) : '',
    turnNumber: normalizeTurnNumber(event?.turnNumber),
    title: typeof event?.title === 'string' ? event.title : 'Life event',
    narrative: typeof event?.narrative === 'string' ? event.narrative : '',
    outcome: ['positive', 'negative', 'neutral'].includes(event?.outcome) ? event.outcome : 'neutral',
    effect: {
      metric: ['cash', 'physicalHealth', 'mentalHealth'].includes(event?.effect?.metric)
        ? event.effect.metric
        : 'mentalHealth',
      amount: Number.isInteger(event?.effect?.amount) ? event.effect.amount : 0,
    },
    source: {
      publisher: typeof event?.source?.publisher === 'string' ? event.source.publisher : 'Modern Game of Life',
      headline: typeof event?.source?.headline === 'string' ? event.source.headline : 'Saved event',
      publishedAt: typeof event?.source?.publishedAt === 'string' ? event.source.publishedAt : null,
    },
    generationMode: event?.generationMode === 'bedrock' ? 'bedrock' : 'fallback',
    createdAt: Number.isFinite(event?.createdAt) ? event.createdAt : 0,
  }))
}

export const normalizeGame = (game) => ({
  ...game,
  id: String(game.id),
  version: Number.isInteger(game.version) && game.version >= 1 ? game.version : 1,
  players: normalizePlayers(game.players),
  turnNumber: normalizeTurnNumber(game.turnNumber),
  activePlayerIndex: normalizeActivePlayerIndex(
    game.activePlayerIndex,
    Array.isArray(game.players) ? game.players.length : 0,
  ),
  moveHistory: normalizeMoveHistory(game.moveHistory),
  events: normalizeEvents(game.events),
})

const normalizeGames = (games) => games.map(normalizeGame)

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
  createGame: async (game) => {
    const games = loadLocalGames()
    const createdGame = normalizeGame({
      ...game,
      id: game.id ? String(game.id) : generateId(),
      isDraft: false,
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
        version: Math.max(existing.version, updates.version || 0),
      })
      const updated = games.map((game) => (game.id === normalizedId ? merged : game))
      saveLocalGames(updated)
      return merged
    }
    throw new Error('Game not found')
  },
  advanceTurn: async (gameId, request) => {
    const normalizedId = String(gameId)
    const games = loadLocalGames()
    const existing = games.find((game) => game.id === normalizedId)
    if (!existing) {
      throw new Error('Game not found')
    }
    const result = advanceLocalGameTurn(existing, request)
    if (!result.idempotent) {
      saveLocalGames(games.map((game) => (game.id === normalizedId ? result.game : game)))
    }
    return result
  },
})

export class ApiRequestError extends Error {
  constructor(status, body) {
    super(body?.message || 'Request failed')
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = response.status === 204 ? '' : await response.text()
  const body = parseJson(text)
  if (!response.ok) {
    throw new ApiRequestError(response.status, body)
  }
  if (response.status === 204) {
    return null
  }
  return body
}

const createApiStorage = (baseUrl) => ({
  listGames: async () => {
    const data = await fetchJson(`${baseUrl}/games`)
    const games = Array.isArray(data?.games) ? data.games : []
    return normalizeGames(games)
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
  advanceTurn: async (gameId, request) => {
    const data = await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}/turns/advance`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
    return {
      game: normalizeGame(data.game),
      event: normalizeEvents([data.event])[0],
      idempotent: Boolean(data.idempotent),
    }
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
