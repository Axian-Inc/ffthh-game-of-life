import React from 'react'

type GameCardProps = {
  id: string
  title: string
  status: string
  players: string
  lastPlayed: string
  avatars: string[]
  onDelete: (id: string) => void
  onResume: (id: string) => void
}

const GameCard: React.FC<GameCardProps> = ({
  id,
  title,
  status,
  players,
  lastPlayed,
  avatars,
  onDelete,
  onResume,
}) => {
  return (
    <article className="game-card">
      <header className="game-card__header">
        <h3>{title}</h3>
        <span className="status-pill">{status}</span>
      </header>
      <div className="game-card__meta">
        <span>{players}</span>
        <span className="meta-dot" aria-hidden="true">
          •
        </span>
        <span>{lastPlayed}</span>
      </div>
      <div className="game-card__avatars" aria-label="Players">
        {avatars.map((avatar, index) => (
          <span key={`${avatar}-${index}`} className="avatar">
            {avatar}
          </span>
        ))}
      </div>
      <div className="game-card__actions">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => onResume(id)}
        >
          <span className="btn-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" />
            </svg>
          </span>
          Resume
        </button>
        <button
          className="btn btn-icon-only"
          type="button"
          aria-label="Delete"
          onClick={() => onDelete(id)}
        >
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path
              d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v9h-2V9Zm4 0h2v9h-2V9ZM7 9h2v9H7V9Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </article>
  )
}

export default GameCard
