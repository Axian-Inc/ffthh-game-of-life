import { useEffect, useMemo, useState } from 'react'
import { createGameStorage } from '../services/gameStorage'

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
    const createdGame = await storage.createGame(game)
    if (!createdGame.isDraft) {
      setGames((current) => [createdGame, ...current])
      setNewGameId(createdGame.id)
    }
    return createdGame
  }

  const deleteGame = async (gameId) => {
    await storage.deleteGame(gameId)
    setGames((current) => current.filter((game) => game.id !== gameId))
  }

  const updateGame = async (gameId, updates) => {
    const updatedGame = await storage.updateGame(gameId, updates)
    const existsInList = games.some((game) => game.id === updatedGame.id)
    setGames((current) =>
      existsInList ? current.map((game) => (game.id === updatedGame.id ? updatedGame : game)) : [updatedGame, ...current],
    )
    if (!existsInList) {
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
