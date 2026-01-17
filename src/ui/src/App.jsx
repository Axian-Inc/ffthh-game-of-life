import './App.css'

function App() {
  const games = [
    {
      id: 1,
      title: 'Friday Family Showdown',
      status: 'active',
      players: 3,
      updated: 'about 1 hour ago',
      avatars: ['😄', '🧑‍🚀', '👩‍🎨'],
      resumable: true,
    },
    {
      id: 2,
      title: 'Weekend Trivia Night',
      status: 'active',
      players: 5,
      updated: 'yesterday',
      avatars: ['🧑‍🍳', '🤠', '🦸', '👩‍🎓', '🧙'],
      resumable: true,
    },
    {
      id: 3,
      title: 'Neighborhood Challenge',
      status: 'active',
      players: 2,
      updated: '2 days ago',
      avatars: ['🧑‍🔧', '👩‍🌾'],
      resumable: false,
    },
    {
      id: 4,
      title: 'Holiday Dice Derby',
      status: 'active',
      players: 4,
      updated: 'last week',
      avatars: ['🎅', '🦌', '🧝‍♀️', '🎁'],
      resumable: true,
    },
  ]
  const isNewGameDisabled = false
  const formatPlayers = (count) => `${count} ${count === 1 ? 'player' : 'players'}`

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
            <span className="badge" aria-label={`${games.length} games`}>
              {games.length}
            </span>
          </div>

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
                    <span key={`${game.id}-${index}`} className="avatar">
                      {avatar}
                    </span>
                  ))}
                </div>
                <div className="card-actions">
                  <button
                    className="cta cta-small"
                    type="button"
                    aria-label={`Resume ${game.title}`}
                    disabled={!game.resumable}
                  >
                    <span className="cta-icon" aria-hidden="true">
                      ▶
                    </span>
                    Resume
                  </button>
                  <button className="icon-button" type="button" aria-label={`Delete ${game.title}`}>
                    🗑
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
