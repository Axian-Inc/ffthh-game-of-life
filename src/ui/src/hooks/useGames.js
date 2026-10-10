import { useCallback, useEffect, useMemo, useState } from 'react'
import { createGameStorage } from '../services/gameStorage'

const useGames = () => {
  const storage = useMemo(() => createGameStorage(), [])
  const [games, setGames] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [newGameId, setNewGameId] = useState(null)

  const loadGames = useCallback(async () => {
    setIsLoading(true)
    setFetchError('')

    try {
      const loadedGames = await storage.listGames()
      setGames(loadedGames)
    } catch {
      setFetchError('Unable to load games. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [storage])

  useEffect(() => {
    loadGames()
  }, [loadGames])

  const createGame = async (game) => {
    const createdGame = await storage.createGame(game)
    setGames((current) => [createdGame, ...current])
    setNewGameId(createdGame.id)
    return createdGame
  }

  const deleteGame = async (gameId) => {
    await storage.deleteGame(gameId)
    const normalizedId = String(gameId)
    setGames((current) => current.filter((game) => game.id !== normalizedId))
  }

  const updateGame = async (gameId, updates) => {
    const updatedGame = await storage.updateGame(gameId, updates)

    setGames((current) => current.map((game) => (game.id === updatedGame.id ? updatedGame : game)))
    return updatedGame
  }

  const advanceTurn = async (gameId, request) => {
    try {
      const result = await storage.advanceTurn(gameId, request)
      setGames((current) => current.map((game) => (game.id === result.game.id ? result.game : game)))
      return result
    } catch (error) {
      if (error?.status === 409) {
        const loadedGames = await storage.listGames()
        setGames(loadedGames)
      }
      throw error
    }
  }

  return {
    games,
    isLoading,
    fetchError,
    loadGames,
    createGame,
    deleteGame,
    updateGame,
    advanceTurn,
    newGameId,
    setNewGameId,
  }
}

export default useGames
