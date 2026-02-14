import { useEffect, useState } from 'react'
import { seedGames } from '../data/seedGames'

const INITIAL_NEXT_ID = 4

const getSeedOverride = () => {
  if (typeof window === 'undefined') {
    return null
  }
  const seed = window.__E2E_SEED__
  return Array.isArray(seed) ? seed : null
}

const getNextId = (games) => {
  const maxId = games.reduce((max, game) => {
    if (typeof game.id === 'number' && Number.isFinite(game.id)) {
      return Math.max(max, game.id)
    }
    return max
  }, 0)
  return maxId ? maxId + 1 : INITIAL_NEXT_ID
}

const useGames = () => {
  const [games, setGames] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [nextId, setNextId] = useState(INITIAL_NEXT_ID)
  const [newGameId, setNewGameId] = useState(null)

  const loadGames = ({ shouldFail = false } = {}) => {
    setIsLoading(true)
    setFetchError('')

    window.setTimeout(() => {
      if (shouldFail) {
        setFetchError('Unable to load games. Check your connection and try again.')
        setIsLoading(false)
        return
      }

      const override = getSeedOverride()
      const nextGames = override || seedGames()
      setGames(nextGames)
      setNextId(getNextId(nextGames))
      setIsLoading(false)
    }, 900)
  }

  useEffect(() => {
    loadGames()
  }, [])

  const addGame = (game) => {
    setGames((current) => [game, ...current])
    setNextId((current) => current + 1)
    setNewGameId(game.id)
  }

  const updateGame = (game) => {
    setGames((current) => current.map((item) => (item.id === game.id ? { ...item, ...game } : item)))
  }

  const deleteGame = (gameId) => {
    setGames((current) => current.filter((game) => game.id !== gameId))
  }

  return {
    games,
    isLoading,
    fetchError,
    loadGames,
    addGame,
    updateGame,
    deleteGame,
    nextId,
    newGameId,
    setNewGameId,
  }
}

export default useGames
