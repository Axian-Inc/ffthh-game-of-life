import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const TurnHandoffPage = ({ game, onStartNextTurn, onExit, isStarting = false, errorMessage = '' }) => {
  const handoff = game.pendingHandoff

  return (
    <section className="turn-page">
      <div className="turn-page-header">
        <p className="eyebrow">Pass the Computer</p>
        <h2>{handoff?.toPlayerName || 'Next Player'}</h2>
        <p className="tagline">
          The previous turn is saved. Hand off the device, then start the next player&apos;s month.
        </p>
      </div>

      <div className="turn-summary-card turn-handoff-card">
        <p>
          <strong>Month:</strong> {game.currentMonth}
        </p>
        <p>
          <strong>Next up:</strong> {handoff?.toPlayerName || 'Unknown player'}
        </p>
        <p>
          <strong>Status:</strong> Ready to begin the next turn
        </p>
      </div>

      <div className="turn-page-actions">
        <PrimaryButton onClick={onStartNextTurn} disabled={isStarting}>
          {isStarting ? 'Opening...' : 'Start Next Turn'}
        </PrimaryButton>
        <SecondaryButton onClick={onExit} disabled={isStarting}>
          Exit to Home
        </SecondaryButton>
      </div>
      {errorMessage ? (
        <p className="field-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  )
}

export default TurnHandoffPage
