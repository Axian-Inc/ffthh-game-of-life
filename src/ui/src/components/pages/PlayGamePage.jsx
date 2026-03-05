import WelcomeToLifePage from './WelcomeToLifePage'

const PlayGamePage = ({ game, onHome, onBegin, mode = 'started' }) => {
  const handleBegin = onBegin || onHome

  return (
    <>
      <WelcomeToLifePage game={game} mode={mode} onBegin={handleBegin} />
      {onHome ? (
        <div className="play-game-legacy-actions">
          <button type="button" className="secondary-action" onClick={onHome}>
            Back to home
          </button>
        </div>
      ) : null}
    </>
  )
}

export default PlayGamePage
