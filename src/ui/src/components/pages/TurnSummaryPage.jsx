import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const renderSignedMetric = (value, formatter = (item) => item) => {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${formatter(value)}`
}

const TurnSummaryPage = ({
  game,
  onContinue,
  onHome,
  isSaving = false,
  summaryError = '',
}) => {
  const summary = game?.lastTurnSummary

  if (!game || !summary) {
    return null
  }

  return (
    <section className="play-game-page turn-summary-page">
      <div className="play-game-header">
        <p className="eyebrow">Turn Summary</p>
        <h2>
          {summary.actingPlayerName} finished Month {summary.monthIndex}
        </h2>
        <p className="tagline">
          {summary.actionLabel} resolved. The next player is {summary.nextPlayerName}.
        </p>
      </div>

      <div className="play-game-panel">
        <div className="turn-panel-heading">
          <h3>Baseline changes</h3>
          <p>These deterministic updates happened before the chosen action.</p>
        </div>
        <dl className="turn-summary-grid">
          <div>
            <dt>Income</dt>
            <dd>{renderSignedMetric(summary.baseline.deltas.income, formatCurrency)}</dd>
          </div>
          <div>
            <dt>Living Costs</dt>
            <dd>{formatCurrency(-summary.baseline.deltas.costOfLiving)}</dd>
          </div>
          <div>
            <dt>Debt Payment</dt>
            <dd>{formatCurrency(-summary.baseline.deltas.debtPayment)}</dd>
          </div>
          <div>
            <dt>Mental Drift</dt>
            <dd>{renderSignedMetric(summary.baseline.deltas.mentalHealth)}</dd>
          </div>
          <div>
            <dt>Physical Drift</dt>
            <dd>{renderSignedMetric(summary.baseline.deltas.physicalHealth)}</dd>
          </div>
        </dl>
      </div>

      <div className="play-game-panel">
        <div className="turn-panel-heading">
          <h3>After action</h3>
          <p>{summary.actionLabel} was your chosen action for this turn.</p>
        </div>
        <dl className="turn-summary-grid">
          <div>
            <dt>Cash</dt>
            <dd>
              {formatCurrency(summary.before.cash)} → {formatCurrency(summary.after.cash)}
            </dd>
          </div>
          <div>
            <dt>Debt</dt>
            <dd>
              {formatCurrency(summary.before.debt)} → {formatCurrency(summary.after.debt)}
            </dd>
          </div>
          <div>
            <dt>Net Worth</dt>
            <dd>
              {formatCurrency(summary.before.netWorth)} → {formatCurrency(summary.after.netWorth)}
            </dd>
          </div>
          <div>
            <dt>Mental Health</dt>
            <dd>
              {summary.before.mentalHealth} → {summary.after.mentalHealth}
            </dd>
          </div>
          <div>
            <dt>Physical Health</dt>
            <dd>
              {summary.before.physicalHealth} → {summary.after.physicalHealth}
            </dd>
          </div>
          <div>
            <dt>Monthly Income</dt>
            <dd>
              {formatCurrency(summary.before.monthlyIncome)} → {formatCurrency(summary.after.monthlyIncome)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="play-game-actions">
        <SecondaryButton disabled={isSaving} onClick={onHome}>
          Back to home
        </SecondaryButton>
        <PrimaryButton disabled={isSaving} onClick={onContinue}>
          {isSaving ? 'Saving...' : `Continue to ${summary.nextPlayerName}`}
        </PrimaryButton>
      </div>

      {summaryError ? (
        <p className="field-error" role="alert">
          {summaryError}
        </p>
      ) : null}
    </section>
  )
}

export default TurnSummaryPage
