import type { Game } from '../types'

const STORAGE_KEY = 'gameHub.games.v1'

export const loadGames = (): Game[] | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Game[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const saveGames = (games: Game[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
}
