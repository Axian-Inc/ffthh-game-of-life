import PrimaryButton from '../ui/PrimaryButton'

const formatDelta = (delta) => {
  if (delta > 0) {
    return `+${delta}`
  }
  return String(delta)
}

const TurnSummaryPage = ({ turnResolution, onContinue }) => (
  <section className="turn-page">
    <div className="turn-page-header">
      <p className="eyebrow">Turn Complete</p>
      <h2>{turnResolution.summary.headline}</h2>
      <p className="tagline">
        Review what changed before handing the game to the next player.
      </p>
    </div>

    <div className="turn-summary-grid">
      <div className="turn-summary-card">
        <h3>Key Changes</h3>
        <ul className="turn-effect-list">
          {turnResolution.summary.keyChanges.map((change) => (
            <li key={change.metric}>
              <strong>{change.metric}:</strong> {formatDelta(change.delta)}
            </li>
          ))}
        </ul>
      </div>
      <div className="turn-summary-card">
        <h3>Event</h3>
        <p>{turnResolution.summary.eventLabel}</p>
        {turnResolution.summary.unintendedOutcomes[0]?.explanation?.activeModifiers?.length ? (
          <ul className="turn-effect-list">
            {turnResolution.summary.unintendedOutcomes[0].explanation.activeModifiers.map((modifier) => (
              <li key={modifier}>{modifier}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>

    <div className="turn-resolution-columns">
      <div className="turn-summary-card">
        <h3>Intended Outcomes</h3>
        <ul className="turn-effect-list">
          {turnResolution.summary.intendedOutcomes.map((item) => (
            <li key={`${item.source}-${item.description}`}>
              <strong>{item.source}:</strong> {item.description}
            </li>
          ))}
        </ul>
      </div>
      <div className="turn-summary-card">
        <h3>Unintended Outcomes</h3>
        <ul className="turn-effect-list">
          {turnResolution.summary.unintendedOutcomes.map((item) => (
            <li key={`${item.source}-${item.description}`}>
              <strong>{item.source}:</strong> {item.description}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="turn-page-actions">
      <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
    </div>
  </section>
)

export default TurnSummaryPage
