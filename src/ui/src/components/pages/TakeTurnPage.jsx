import { TURN_ACTIONS } from '../../services/gameplay'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const TakeTurnPage = ({
  game,
  onCompleteTurn,
  onHome,
  isSaving = false,
  turnError = '',
}) => {
  const activePlayer = game?.players?.[game?.playState?.activePlayerIndex] || null

  if (!game || !activePlayer) {
    return null
  }

  return (
    <section className="play-game-page take-turn-page">
      <div className="play-game-header">
        <p className="eyebrow">Take A Turn</p>
        <h2>
          Month {game.playState.monthIndex}, {activePlayer.name}&apos;s turn
        </h2>
        <p className="tagline">
          Review the month, choose one action, and lock in the result for the next player.
        </p>
      </div>

      <div className="play-game-panel turn-hero-panel">
        <div className="turn-player-header">
          <div className="turn-player-avatar" aria-hidden="true">
            <PlayerAvatar avatar={activePlayer.avatar} decorative />
          </div>
          <div>
            <h3>{activePlayer.name}</h3>
            <p>
              {activePlayer.cityName} · {activePlayer.careerName}
            </p>
          </div>
        </div>
        <dl className="turn-stats-grid">
          <div>
            <dt>Cash</dt>
            <dd>{formatCurrency(activePlayer.cash)}</dd>
          </div>
          <div>
            <dt>Debt</dt>
            <dd>{formatCurrency(activePlayer.debt)}</dd>
          </div>
          <div>
            <dt>Net Worth</dt>
            <dd>{formatCurrency(activePlayer.netWorth)}</dd>
          </div>
          <div>
            <dt>Monthly Income</dt>
            <dd>{formatCurrency(activePlayer.monthlyIncome)}</dd>
          </div>
          <div>
            <dt>Physical Health</dt>
            <dd>{activePlayer.physicalHealth}</dd>
          </div>
          <div>
            <dt>Mental Health</dt>
            <dd>{activePlayer.mentalHealth}</dd>
          </div>
        </dl>
      </div>

      <div className="play-game-panel">
        <div className="turn-panel-heading">
          <h3>Monthly baseline</h3>
          <p>
            Income, living costs, debt payments, and city or education effects apply before your action.
          </p>
        </div>
        <ul className="turn-baseline-list">
          <li>Receive your monthly income based on your current career.</li>
          <li>Pay city living costs based on where you live.</li>
          <li>Make the monthly minimum payment on debt.</li>
          <li>Adjust physical and mental health using city and education modifiers.</li>
        </ul>
      </div>

      <div className="play-game-panel">
        <div className="turn-panel-heading">
          <h3>Choose one action</h3>
          <p>Actions are deterministic in this MVP, so the preview is the exact effect.</p>
        </div>
        <div className="turn-action-grid">
          {TURN_ACTIONS.map((action) => (
            <article className="turn-action-card" key={action.id}>
              <h4>{action.label}</h4>
              <p>{action.description}</p>
              <strong>{action.effectText}</strong>
              <PrimaryButton disabled={isSaving} onClick={() => onCompleteTurn(action.id)}>
                {isSaving ? 'Saving...' : `Choose ${action.label}`}
              </PrimaryButton>
            </article>
          ))}
        </div>
      </div>

      <div className="play-game-actions">
        <SecondaryButton disabled={isSaving} onClick={onHome}>
          Back to home
        </SecondaryButton>
      </div>

      {turnError ? (
        <p className="field-error" role="alert">
          {turnError}
        </p>
      ) : null}
    </section>
  )
}

export default TakeTurnPage
