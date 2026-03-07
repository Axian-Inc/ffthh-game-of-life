import { useEffect, useMemo, useState } from 'react'
import { createGameStorage } from '../services/gameStorage'

const generateDraftId = (games, draftGamesById) => {
  const existingIds = new Set([
    ...games.map((game) => String(game.id)),
    ...Object.keys(draftGamesById),
  ])
  let nextId = ''
  do {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      nextId = crypto.randomUUID()
    } else {
      nextId = `draft-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    }
  } while (existingIds.has(nextId))
  return nextId
}

const useGames = () => {
  const storage = useMemo(() => createGameStorage(), [])
  const [games, setGames] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [newGameId, setNewGameId] = useState(null)
  const [draftGamesById, setDraftGamesById] = useState({})

  const loadGames = async () => {
    setIsLoading(true)
    setFetchError('')

    try {
      const loadedGames = await storage.listGames()
      setGames(loadedGames)
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
    const draftGame = {
      ...game,
      id: game.id ? String(game.id) : generateDraftId(games, draftGamesById),
    }
    setDraftGamesById((current) => ({
      ...current,
      [draftGame.id]: draftGame,
    }))
    return draftGame
  }

  const deleteGame = async (gameId) => {
    const normalizedId = String(gameId)
    if (draftGamesById[normalizedId]) {
      setDraftGamesById((current) => {
        const { [normalizedId]: _ignored, ...rest } = current
        return rest
      })
      return
    }
    await storage.deleteGame(gameId)
    setGames((current) => current.filter((game) => game.id !== normalizedId))
  }

  const updateGame = async (gameId, updates) => {
    const normalizedId = String(gameId)
    const draftGame = draftGamesById[normalizedId]

    if (draftGame) {
      const createdGame = await storage.createGame({
        ...draftGame,
        ...updates,
        id: normalizedId,
      })
      setDraftGamesById((current) => {
        const { [normalizedId]: _ignored, ...rest } = current
        return rest
      })
      setGames((current) => [createdGame, ...current.filter((game) => game.id !== createdGame.id)])
      setNewGameId(createdGame.id)
      return createdGame
    }

    const updatedGame = await storage.updateGame(gameId, updates)
    setGames((current) => current.map((game) => (game.id === updatedGame.id ? updatedGame : game)))
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
