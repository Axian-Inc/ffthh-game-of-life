import { Link, useParams } from 'react-router-dom'

import { useGames } from '../state/games'

const GameDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { getGameById } = useGames()

  const game = id ? getGameById(id) : undefined

  if (!game) {
    return (
      <main className="detail">
        <div className="detail__card">
          <h1>Game not found</h1>
          <p>We couldn't find that game. It may have been deleted.</p>
          <Link className="btn btn-primary" to="/">
            Back to Hub
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="detail">
      <div className="detail__card">
        <div className="detail__header">
          <h1>{game.name}</h1>
          <span className="status-pill">{game.status}</span>
        </div>
        <div className="detail__players">
          <h2>Players</h2>
          <ul>
            {game.players.map((player) => (
              <li key={player.id}>
                <span className="avatar">{player.avatar}</span>
                <span>{player.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="detail__note">Gameplay screen coming soon.</p>
        <Link className="btn btn-ghost" to="/">
          Back to Hub
        </Link>
      </div>
    </main>
  )
}

export default GameDetail
