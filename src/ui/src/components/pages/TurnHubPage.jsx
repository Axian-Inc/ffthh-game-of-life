import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    Number(value || 0),
  )

const TurnHubPage = ({
  game,
  activePlayer,
  selectedActionId,
  onSelectAction,
  onTakeTurn,
  onSaveAndExit,
  isSubmitting = false,
  errorMessage = '',
}) => (
  <section className="turn-page">
    <div className="turn-page-header">
      <p className="eyebrow">Month {game.currentMonth}</p>
      <h2>{activePlayer?.name}&apos;s Turn</h2>
      <p className="tagline">
        One action this month. Preview the tradeoff, then resolve the turn and pass the computer.
      </p>
    </div>

    <div className="turn-summary-grid">
      <div className="turn-summary-card">
        <h3>Financial</h3>
        <p>Cash: {formatCurrency(activePlayer?.cash)}</p>
        <p>Net Worth: {formatCurrency(activePlayer?.netWorth)}</p>
        <p>
          Debt:{' '}
          {formatCurrency(
            activePlayer?.debts?.reduce((total, debt) => total + Number(debt.balance || 0), 0) || 0,
          )}
        </p>
      </div>
      <div className="turn-summary-card">
        <h3>Health</h3>
        <p>Physical: {activePlayer?.physicalHealth ?? 0}</p>
        <p>Mental: {activePlayer?.mentalHealth ?? 0}</p>
        <p>Career: {activePlayer?.careerId?.replace(/-/g, ' ') || 'Unknown'}</p>
      </div>
    </div>

    <div className="turn-action-list">
      {game.availableActions.map((action) => {
        const isSelected = selectedActionId === action.id
        return (
          <button
            key={action.id}
            type="button"
            className={`turn-action-card${isSelected ? ' is-selected' : ''}`}
            onClick={() => onSelectAction(action.id)}
            aria-pressed={isSelected}
          >
            <div className="turn-action-card-header">
              <h3>{action.label}</h3>
              <span>{action.description}</span>
            </div>
            <div className="turn-action-card-metrics">
              <span>Cash {action.preview.cash[0]} to {action.preview.cash[1]}</span>
              <span>Net Worth {action.preview.netWorth[0]} to {action.preview.netWorth[1]}</span>
              <span>Physical {action.preview.physicalHealth[0]} to {action.preview.physicalHealth[1]}</span>
              <span>Mental {action.preview.mentalHealth[0]} to {action.preview.mentalHealth[1]}</span>
            </div>
            <ul className="turn-action-risks">
              {action.preview.riskNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </button>
        )
      })}
    </div>

    <div className="turn-page-actions">
      <PrimaryButton onClick={onTakeTurn} disabled={isSubmitting || !selectedActionId}>
        {isSubmitting ? 'Resolving...' : 'Take Turn'}
      </PrimaryButton>
      <SecondaryButton onClick={onSaveAndExit} disabled={isSubmitting}>
        Save and Exit
      </SecondaryButton>
    </div>
    {errorMessage ? (
      <p className="field-error" role="alert">
        {errorMessage}
      </p>
    ) : null}
  </section>
)

export default TurnHubPage
