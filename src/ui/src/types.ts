export type Player = { id: string; name: string; avatar: string }
export type GameStatus = 'active' | 'paused' | 'completed'
export type Game = {
  id: string
  name: string
  status: GameStatus
  players: Player[]
  updatedAt: number
}
