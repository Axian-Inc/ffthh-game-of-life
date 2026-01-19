import { useEffect, useState } from 'react'
import { seedGames } from '../data/seedGames'

const INITIAL_NEXT_ID = 4

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

      setGames(seedGames())
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

  const deleteGame = (gameId) => {
    setGames((current) => current.filter((game) => game.id !== gameId))
  }

  return {
    games,
    isLoading,
    fetchError,
    loadGames,
    addGame,
    deleteGame,
    nextId,
    newGameId,
    setNewGameId,
  }
}

export default useGames
