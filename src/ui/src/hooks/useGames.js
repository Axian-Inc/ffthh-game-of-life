import { useEffect, useMemo, useRef, useState } from 'react'
import { createGameStorage } from '../services/gameStorage'

const useGames = () => {
  const storage = useMemo(() => createGameStorage(), [])
  const [games, setGames] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [newGameId, setNewGameId] = useState(null)
  const draftGameIdsRef = useRef(new Set())

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
    if (createdGame?.isDraft) {
      draftGameIdsRef.current.add(createdGame.id)
      return createdGame
    }

    setGames((current) => [createdGame, ...current])
    setNewGameId(createdGame.id)
    return createdGame
  }

  const deleteGame = async (gameId) => {
    await storage.deleteGame(gameId)
    const normalizedId = String(gameId)
    draftGameIdsRef.current.delete(normalizedId)
    setGames((current) => current.filter((game) => game.id !== normalizedId))
  }

  const updateGame = async (gameId, updates) => {
    const normalizedId = String(gameId)
    const isDraftGame = draftGameIdsRef.current.has(normalizedId)
    const updatedGame = await storage.updateGame(gameId, updates)

    if (isDraftGame) {
      draftGameIdsRef.current.delete(normalizedId)
      setGames((current) => [updatedGame, ...current.filter((game) => game.id !== updatedGame.id)])
      setNewGameId(updatedGame.id)
      return updatedGame
    }

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
