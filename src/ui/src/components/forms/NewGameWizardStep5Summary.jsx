import PlayerAvatar from '../ui/PlayerAvatar'

const toMap = (items) => Object.fromEntries(items.map((item) => [item.key, item]))

const NewGameWizardStep5Summary = ({ gameName, players, detailsByPlayerId, cityCatalog, trackCatalog }) => {
  const cityByKey = toMap(cityCatalog)
  const trackByKey = toMap(trackCatalog)

  return (
    <section className="wizard-step">
      <h3 className="wizard-title">Summary</h3>
      <p className="wizard-subtitle">Review players, then add another player or start the game.</p>

      <div className="wizard-summary-game-name">
        <span className="wizard-summary-label">Game Name</span>
        <strong>{gameName || 'Waiting for first player...'}</strong>
      </div>

      <div className="wizard-summary-list" role="list" aria-label="Configured players">
        {players.map((player) => {
          const details = detailsByPlayerId[player.id] || {}
          const track = details.trackKey ? trackByKey[details.trackKey] : null
          const selectedJob = track?.jobs.find(
            (job) => job.toLowerCase().replace(/[^a-z0-9]+/g, '-') === details.jobKey,
          )

          return (
            <article key={player.id} className="wizard-summary-card" role="listitem">
              <div className="wizard-summary-header">
                <PlayerAvatar avatar={player.avatar} decorative />
                <div>
                  <h4>{player.name}</h4>
                  <p>{cityByKey[details.cityKey]?.label || 'City pending'}</p>
                </div>
              </div>
              <dl>
                <div>
                  <dt>Track</dt>
                  <dd>{track?.label || 'Track pending'}</dd>
                </div>
                <div>
                  <dt>Job</dt>
                  <dd>{selectedJob || 'Job pending'}</dd>
                </div>
              </dl>
            </article>
          )
        })}
      </div>

      {players.length < 2 ? <p className="footer-hint">Configure at least 2 players to enable Start Game.</p> : null}
    </section>
  )
}

export default NewGameWizardStep5Summary
