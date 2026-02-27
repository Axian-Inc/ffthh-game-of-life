import PrimaryButton from '../ui/PrimaryButton'

const PlayGamePage = ({ game, onHome }) => (
  <section className="play-game-page">
    <div className="play-game-header">
      <p className="eyebrow">Play Game</p>
      <h2>{game?.name || 'New Game'}</h2>
      <p className="tagline">
        This is placeholder content for the play experience. The game board and controls will
        live here.
      </p>
    </div>
    <div className="play-game-panel">
      <div className="play-game-placeholder">Game board coming soon.</div>
    </div>
    <div className="play-game-actions">
      <PrimaryButton onClick={onHome}>Back to home</PrimaryButton>
    </div>
  </section>
)

export default PlayGamePage
