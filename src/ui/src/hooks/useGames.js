import { useEffect, useMemo, useState } from 'react'
import { createGameStorage, normalizeGameRecord } from '../services/gameStorage'

const DRAFT_ID_PREFIX = 'draft-'

const generateDraftId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${DRAFT_ID_PREFIX}${crypto.randomUUID()}`
  }
  return `${DRAFT_ID_PREFIX}${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

const isDraftGame = (gameId, updates) => {
  if (updates?.__draft) {
    return true
  }
  return typeof gameId === 'string' && gameId.startsWith(DRAFT_ID_PREFIX)
}

const normalizeDraftGame = (game) => ({
  ...game,
  id: game.id || generateDraftId(),
  __draft: true,
})

const useGames = () => {
  const storage = useMemo(() => createGameStorage(), [])
  const [games, setGames] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [newGameId, setNewGameId] = useState(null)

  const loadGames = async () => {
    setIsLoading(true)
    setFetchError('')

    try {
      const loadedGames = await storage.listGames()
      setGames(loadedGames.map(normalizeGameRecord))
    } catch (error) {
      setFetchError('Unable to load games. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGames()
  }, [])

  const createGame = async (game) => {
    return normalizeDraftGame(game)
  }

  const deleteGame = async (gameId) => {
    await storage.deleteGame(gameId)
    setGames((current) => current.filter((game) => game.id !== String(gameId)))
  }

  const updateGame = async (gameId, updates) => {
    const shouldPersistDraft = isDraftGame(gameId, updates)
    const { __draft: _draftMarker, ...persistedUpdates } = updates || {}

    const savedGame = shouldPersistDraft
      ? await storage.createGame(persistedUpdates)
      : await storage.updateGame(gameId, persistedUpdates)
    const updatedGame = normalizeGameRecord(savedGame)

    setGames((current) => {
      const exists = current.some((game) => game.id === updatedGame.id)
      if (!exists) {
        return [updatedGame, ...current]
      }
      return current.map((game) => (game.id === updatedGame.id ? updatedGame : game))
    })

    if (shouldPersistDraft) {
      setNewGameId(updatedGame.id)
    }

    return updatedGame
  }

  return {
    games,
    isLoading,
    fetchError,
    loadGames,
    createGame,
    deleteGame,
    updateGame,
    newGameId,
    setNewGameId,
  }
}

export default useGames
