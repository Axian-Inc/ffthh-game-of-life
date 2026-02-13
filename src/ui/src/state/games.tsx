import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { loadGames, saveGames } from '../lib/storage'
import type { Game, Player } from '../types'

const avatarPool = ['😀', '🦊', '🐸', '👑', '🤖', '🐱', '🐶', '🐵', '🦁']

type GamesContextValue = {
  games: Game[]
  createGame: (game: Game) => void
  deleteGame: (id: string) => void
  touchGame: (id: string) => void
  getGameById: (id: string) => Game | undefined
}

const GamesContext = createContext<GamesContextValue | undefined>(undefined)

const seedPlayers = (names: string[]): Player[] =>
  names.map((name, index) => ({
    id: `seed-${name}-${index}`,
    name,
    avatar: avatarPool[index % avatarPool.length],
  }))

const seedGames = (): Game[] => {
  const now = Date.now()

  return [
    {
      id: 'seed-family-game-night',
      name: 'Family Game Night',
      status: 'active',
      players: seedPlayers(['Maya', 'Ezra', 'Skye']),
      updatedAt: now - 60 * 60 * 1000,
    },
    {
      id: 'seed-weekend-tournament',
      name: 'Weekend Tournament',
      status: 'active',
      players: seedPlayers(['Jules', 'Rowan']),
      updatedAt: now - 2 * 60 * 60 * 1000,
    },
  ]
}

type GamesProviderProps = {
  children: ReactNode
}

export const GamesProvider = ({ children }: GamesProviderProps) => {
  const [games, setGames] = useState<Game[]>(() => {
    const stored = loadGames()
    if (stored && stored.length > 0) {
      return stored
    }

    return seedGames()
  })

  useEffect(() => {
    saveGames(games)
  }, [games])

  const value = useMemo<GamesContextValue>(() => {
    const createGame = (game: Game) => {
      setGames((prev) => [game, ...prev])
    }

    const deleteGame = (id: string) => {
      setGames((prev) => prev.filter((game) => game.id !== id))
    }

    const touchGame = (id: string) => {
      setGames((prev) =>
        prev.map((game) =>
          game.id === id ? { ...game, updatedAt: Date.now() } : game,
        ),
      )
    }

    const getGameById = (id: string) => games.find((game) => game.id === id)

    return { games, createGame, deleteGame, touchGame, getGameById }
  }, [games])

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}

export const useGames = () => {
  const context = useContext(GamesContext)
  if (!context) {
    throw new Error('useGames must be used within GamesProvider')
  }
  return context
}
