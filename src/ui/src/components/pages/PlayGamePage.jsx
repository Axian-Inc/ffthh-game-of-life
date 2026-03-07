import PrimaryButton from '../ui/PrimaryButton'

const PlayGamePage = ({ game, onHome }) => (
  <section className="play-game-page">
    <div className="welcome-panel">
      <div className="welcome-logo" aria-hidden="true">
        Life
      </div>
      <div className="play-game-header">
        <h2>Welcome to Life!</h2>
        <p className="tagline">
          {game?.name ? `${game.name} is ready to begin.` : 'Your next game is ready to begin.'}
        </p>
      </div>
      <div className="welcome-copy">
        <section>
          <h3>A Month at a Time</h3>
          <p>
            Every turn represents one in-game month. Life moves forward. Your turn summary shows
            income, costs, and health updates.
          </p>
        </section>
        <section>
          <h3>Choices Matter</h3>
          <p>
            Each turn, you get one action. Choose a path. Your choices create modifiers with
            immediate, delayed, and cumulative effects.
          </p>
        </section>
        <blockquote className="welcome-quote">
          <p>"The best way to predict your future is to create it."</p>
          <footer>Abraham Lincoln</footer>
        </blockquote>
        <section>
          <h3>Life Happens</h3>
          <p>
            Players are affected by randomized life events. Check explanations to see how likely an
            event was and what decisions influenced it.
          </p>
        </section>
      </div>
      <div className="play-game-actions">
        <PrimaryButton onClick={onHome}>Let&apos;s Begin!</PrimaryButton>
      </div>
    </div>
  </section>
)

export default PlayGamePage
