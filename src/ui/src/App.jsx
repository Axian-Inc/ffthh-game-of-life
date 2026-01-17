import './App.css'

function App() {
  const games = [
    { id: 1, title: 'Friday Family Showdown' },
    { id: 2, title: 'Weekend Trivia Night' },
    { id: 3, title: 'Neighborhood Challenge' },
    { id: 4, title: 'Holiday Dice Derby' },
  ]

  return (
    <div className="app">
      <main className="hub">
        <div className="icon-wrap" aria-hidden="true">
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

        <button className="cta" type="button" aria-label="Create new game">
          <span className="cta-icon">+</span> New Game
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
                <div className="game-title">{game.title}</div>
                <div className="game-meta">Tap to manage your session</div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
