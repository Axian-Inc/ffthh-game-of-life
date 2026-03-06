import { seedGames } from '../data/seedGames'
import { createCommittedPlayer } from '../utils/gameValidation'

const STORAGE_KEY = 'ffthh-game-of-life.games'

const normalizePlayer = (player, index) => ({
  ...player,
  id: player?.id ? String(player.id) : `player-${index + 1}`,
  name: typeof player?.name === 'string' ? player.name.trim() : '',
  avatar: typeof player?.avatar === 'string' ? player.avatar : '',
  cityId: typeof player?.cityId === 'string' ? player.cityId : '',
  educationTrackId: typeof player?.educationTrackId === 'string' ? player.educationTrackId : '',
  jobId: typeof player?.jobId === 'string' ? player.jobId : '',
  annualSalary: Number(player?.annualSalary) ?? 0,
  monthlyIncome: typeof player?.monthlyIncome === 'number' ? player.monthlyIncome : 0,
  cash: Number(player?.cash) ?? 0,
  debt: Number(player?.debt) ?? 0,
  assets: Array.isArray(player?.assets) ? player.assets : [],
  investments: Array.isArray(player?.investments) ? player.investments : [],
  netWorth: typeof player?.netWorth === 'number' ? player.netWorth : 0,
})

const normalizeGame = (game) => ({
  ...game,
  id: String(game.id),
  name: typeof game?.name === 'string' ? game.name.trim() : '',
  players: Array.isArray(game?.players) ? game.players.map(normalizePlayer) : [],
  status: game?.status || 'active',
  resumable: game?.resumable ?? true,
  lifecycle: {
    phase: typeof game?.lifecycle?.phase === 'string' ? game.lifecycle.phase : '',
    ...game.lifecycle,
  },
  startedAt: game?.startedAt ? new Date(game.startedAt).toISOString() : null,
  lastUpdated: typeof game?.lastUpdated === 'number' ? game.lastUpdated : Date.now(),
  createdAt: typeof game?.createdAt === 'number' ? game.createdAt : Date.now(),
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

const createLocalStorage = () => {
  const draftIds = new Set()

  return {
    listGames: async () => loadLocalGames(),
    createGame: async (game) => {
      const createdGame = normalizeGame({
        ...game,
        id: game.id ? String(game.id) : generateId(),
      })
      draftIds.add(createdGame.id)
      return createdGame
    },
    deleteGame: async (gameId) => {
      draftIds.delete(String(gameId))
      const games = loadLocalGames()
      const updated = games.filter((game) => game.id !== String(gameId))
      saveLocalGames(updated)
    },
    updateGame: async (gameId, updates) => {
      const normalizedId = String(gameId)
      const games = loadLocalGames()
      const existing = games.find((game) => game.id === normalizedId)
      const merged = normalizeGame({
        ...existing,
        ...updates,
        id: normalizedId,
      })

      if (!existing || draftIds.has(normalizedId)) {
        draftIds.delete(normalizedId)
        const created = [merged, ...games]
        saveLocalGames(created)
        return merged
      }

      const updated = games.map((game) => (game.id === normalizedId ? merged : game))
      saveLocalGames(updated)
      return merged
    },
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
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }
  if (response.status === 204) {
    return null
  }
  return response.json()
}

const createApiStorage = (baseUrl) => {
  const draftIds = new Set()

  return {
    listGames: async () => {
      const data = await fetchJson(`${baseUrl}/games`)
      const games = Array.isArray(data?.games) ? data.games : []
      return normalizeGames(games)
    },
    createGame: async (game) => {
      const createdGame = normalizeGame({
        ...game,
        id: game.id ? String(game.id) : generateId(),
      })
      draftIds.add(createdGame.id)
      return createdGame
    },
    deleteGame: async (gameId) => {
      draftIds.delete(String(gameId))
      await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}`, { method: 'DELETE' })
    },
    updateGame: async (gameId, updates) => {
      const normalizedId = String(gameId)
      const normalizedGame = normalizeGame({
        ...updates,
        id: normalizedId,
      })

      if (draftIds.has(normalizedId)) {
        draftIds.delete(normalizedId)
        const data = await fetchJson(`${baseUrl}/games`, {
          method: 'POST',
          body: JSON.stringify({ game: normalizedGame }),
        })
        return data?.game ? normalizeGame(data.game) : normalizedGame
      }

      const data = await fetchJson(`${baseUrl}/games/${encodeURIComponent(gameId)}`, {
        method: 'PUT',
        body: JSON.stringify({ game: normalizedGame }),
      })
      return data?.game ? normalizeGame(data.game) : normalizedGame
    },
  }
}

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
