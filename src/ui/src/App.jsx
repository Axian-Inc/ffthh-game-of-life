import { useEffect, useState } from 'react'
import './App.css'

const Avatar = ({ avatar, fallback }) => {
  const [hasError, setHasError] = useState(false)

  if (avatar.type === 'emoji' || hasError) {
    return (
      <span className="avatar" aria-label="Player avatar">
        {avatar.type === 'emoji' ? avatar.value : fallback}
      </span>
    )
  }

  return (
    <img
      className="avatar avatar-img"
      src={avatar.value}
      alt="Player avatar"
      onError={() => setHasError(true)}
    />
  )
}

function App() {
  const initialGames = [
    {
      id: 1,
      title: 'Friday Family Showdown',
      status: 'active',
      players: 3,
      updated: 'about 1 hour ago',
      avatars: [
        { type: 'emoji', value: '😄' },
        { type: 'image', value: 'https://i.pravatar.cc/100?img=12' },
        { type: 'emoji', value: '👩‍🎨' },
      ],
      resumable: true,
    },
    {
      id: 2,
      title: 'Weekend Trivia Night',
      status: 'active',
      players: 5,
      updated: 'about 1 day ago',
      avatars: [
        { type: 'emoji', value: '🧑‍🍳' },
        { type: 'emoji', value: '🤠' },
        { type: 'image', value: 'https://i.pravatar.cc/100?img=32' },
        { type: 'emoji', value: '👩‍🎓' },
        { type: 'emoji', value: '🧙' },
      ],
      resumable: true,
    },
    {
      id: 3,
      title: 'Neighborhood Challenge',
      status: 'active',
      players: 2,
      updated: 'about 2 days ago',
      avatars: [
        { type: 'image', value: 'https://i.pravatar.cc/100?img=5' },
        { type: 'image', value: 'https://example.invalid/avatar.png' },
      ],
      resumable: false,
    },
    {
      id: 4,
      title: 'Holiday Dice Derby',
      status: 'active',
      players: 4,
      updated: 'about 1 week ago',
      avatars: [
        { type: 'emoji', value: '🎅' },
        { type: 'emoji', value: '🦌' },
        { type: 'emoji', value: '🧝‍♀️' },
        { type: 'emoji', value: '🎁' },
      ],
      resumable: true,
    },
  ]
  const [games, setGames] = useState([])
  const [pendingDelete, setPendingDelete] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const isNewGameDisabled = false
  const formatPlayers = (count) => `${count} ${count === 1 ? 'player' : 'players'}`
  const avatarFallback = '🙂'
  const skeletonItems = Array.from({ length: 4 }, (_, index) => index)
  const simulatedFailure = false

  const loadGames = () => {
    setLoadState('loading')
    const timer = setTimeout(() => {
      if (simulatedFailure) {
        setLoadState('error')
        return
      }
      setGames(initialGames)
      setLoadState('ready')
    }, 700)
    return () => clearTimeout(timer)
  }

  useEffect(() => {
    const cleanup = loadGames()
    return cleanup
  }, [])
  const handleDelete = () => {
    if (!pendingDelete) {
      return
    }
    setGames((current) => current.filter((game) => game.id !== pendingDelete.id))
    setPendingDelete(null)
  }

  return (
    <div className="app">
      <main className="hub">
        <div className="icon-wrap">
          <svg
            className="icon"
            viewBox="0 0 64 64"
            role="img"
            aria-label="Game controller"
          >
            <rect x="8" y="18" width="48" height="28" rx="14" />
            <circle cx="24" cy="32" r="6" />
            <rect x="20" y="30" width="8" height="4" rx="2" />
            <circle cx="42" cy="30" r="3" />
            <circle cx="48" cy="34" r="3" />
          </svg>
        </div>

        <h1 className="title">Game Hub</h1>
        <p className="subtitle">
          Family fun starts here! Create games, add players, and let the good times roll.
        </p>

        <button
          className="cta"
          type="button"
          aria-label="Create new game"
          disabled={isNewGameDisabled}
          onClick={() => {
            if (isNewGameDisabled) {
              return
            }
            window.location.href = '/new-game'
          }}
        >
          <span className="cta-icon" aria-hidden="true">
            +
          </span>
          New Game
        </button>

        <section className="games">
          <div className="section-header">
            <div className="section-title">
              <span className="trophy" aria-hidden="true">
                🏆
              </span>
              <span>Your Games</span>
            </div>
            <span className="badge" aria-live="polite" aria-label={`${games.length} games`}>
              {games.length}
            </span>
          </div>

          {loadState === 'loading' ? (
            <div className="grid">
              {skeletonItems.map((item) => (
                <div key={item} className="game-card skeleton-card" aria-hidden="true">
                  <div className="card-header">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-pill" />
                  </div>
                  <div className="meta-row">
                    <div className="skeleton-line skeleton-meta" />
                    <div className="skeleton-line skeleton-meta" />
                  </div>
                  <div className="avatars">
                    {Array.from({ length: 4 }, (_, index) => (
                      <div key={index} className="skeleton-avatar" />
                    ))}
                  </div>
                  <div className="card-actions">
                    <div className="skeleton-button" />
                    <div className="skeleton-icon" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadState === 'error' ? (
            <div className="error-state" role="alert">
              <p>We ran into a problem loading your games.</p>
              <button className="ghost-button" type="button" onClick={loadGames}>
                Retry
              </button>
            </div>
          ) : games.length === 0 ? (
            <div className="empty-state">
              No games yet. Create a new game to get started!
            </div>
          ) : (
            <div className="grid">
              {games.map((game) => (
                <article key={game.id} className="game-card">
                  <div className="card-header">
                    <div className="game-title" title={game.title}>
                      {game.title}
                    </div>
                    <span className="status-badge">{game.status}</span>
                  </div>
                  <div className="meta-row">
                    <div className="meta-item">
                      <span className="meta-icon" aria-hidden="true">
                        👥
                      </span>
                      {formatPlayers(game.players)}
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon" aria-hidden="true">
                        ⏱
                      </span>
                      {game.updated}
                    </div>
                  </div>
                  <div className="avatars" aria-label="Players">
                    {game.avatars.map((avatar, index) => (
                      <Avatar
                        key={`${game.id}-${index}`}
                        avatar={avatar}
                        fallback={avatarFallback}
                      />
                    ))}
                  </div>
                  <div className="card-actions">
                    <button
                      className="cta cta-small"
                      type="button"
                      aria-label={`Resume ${game.title}`}
                      disabled={!game.resumable}
                      onClick={() => {
                        if (!game.resumable) {
                          return
                        }
                        window.location.href = `/games/${game.id}`
                      }}
                    >
                      <span className="cta-icon" aria-hidden="true">
                        ▶
                      </span>
                      Resume
                    </button>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={`Delete ${game.title}`}
                      onClick={() => setPendingDelete(game)}
                    >
                      🗑
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {pendingDelete ? (
          <div className="dialog-backdrop" role="presentation">
            <div className="dialog" role="dialog" aria-modal="true">
              <h2 className="dialog-title">Delete game?</h2>
              <p className="dialog-body">
                Are you sure you want to delete “{pendingDelete.title}”?
              </p>
              <div className="dialog-actions">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setPendingDelete(null)}
                >
                  Cancel
                </button>
                <button className="danger-button" type="button" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default App
