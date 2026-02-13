import type { CSSProperties } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import GameCard from '../components/GameCard'
import NewGameModal from '../components/NewGameModal'
import { formatRelativeTime } from '../lib/time'
import { useGames } from '../state/games'
import type { Game } from '../types'

const formatPlayers = (count: number) => `${count} player${count === 1 ? '' : 's'}`

const Hub = () => {
  const { games, createGame, deleteGame, touchGame } = useGames()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleCreate = (game: Game) => {
    createGame(game)
  }

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('Delete this game?')
    if (!confirmed) {
      return
    }

    deleteGame(id)
  }

  const handleResume = (id: string) => {
    touchGame(id)
    navigate(`/game/${id}`)
  }

  return (
    <main className="hub">
      <section className="hub__hero">
        <div className="hub__icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
            <rect x="12" y="20" width="40" height="24" rx="12" fill="#fdf1df" />
            <rect x="20" y="28" width="12" height="8" rx="4" fill="#2f2a25" />
            <circle cx="44" cy="30" r="4" fill="#2f2a25" />
            <circle cx="50" cy="34" r="3" fill="#2f2a25" />
            <rect x="26" y="24" width="3" height="16" rx="1.5" fill="#2f2a25" />
            <rect x="22" y="28" width="12" height="3" rx="1.5" fill="#2f2a25" />
          </svg>
        </div>
        <h1>Game Hub</h1>
        <p>
          Family fun starts here! Create games, add players, and let the good
          times roll.
        </p>
        <button
          className="btn btn-primary btn-hero"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          + New Game
        </button>
      </section>

      <section className="hub__section">
        <div className="hub__section-head">
          <h2>Your Games</h2>
          <span className="badge">{games.length}</span>
        </div>
        <div className="hub__grid">
          {games.map((game, index) => (
            <div
              className="hub__card-wrap"
              style={{ '--delay': `${index * 120}ms` } as CSSProperties}
              key={game.id}
            >
              <GameCard
                id={game.id}
                title={game.name}
                status={game.status}
                players={formatPlayers(game.players.length)}
                lastPlayed={formatRelativeTime(game.updatedAt)}
                avatars={game.players.map((player) => player.avatar)}
                onDelete={handleDelete}
                onResume={handleResume}
              />
            </div>
          ))}
        </div>
      </section>
      <NewGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </main>
  )
}

export default Hub
