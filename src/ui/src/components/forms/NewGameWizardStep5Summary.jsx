import PlayerAvatar from '../ui/PlayerAvatar'

const NewGameWizardStep5Summary = ({ summaryPlayers, cityById, trackById, jobById }) => (
  <div className="wizard-step-content wizard-summary">
    <div className="wizard-summary-list" aria-label="Configured players summary">
      {summaryPlayers.map((player) => {
        const city = cityById[player.cityId]
        const track = trackById[player.educationTrackId]
        const job = jobById[player.jobId]
        return (
          <div className="wizard-summary-row" key={player.localId}>
            <div className="wizard-summary-cell">
              <span className="wizard-summary-icon" aria-hidden="true">
                <PlayerAvatar avatar={player.avatar} decorative />
              </span>
              <div>
                <p>Name: {player.name}</p>
                <p>City: {city?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="wizard-summary-cell">
              <span className="wizard-token" aria-hidden="true">
                {track?.iconToken || 'EDU'}
              </span>
              <p>Education: {track?.name || 'N/A'}</p>
            </div>
            <div className="wizard-summary-cell">
              <span className="wizard-token" aria-hidden="true">
                {job?.artToken || 'JOB'}
              </span>
              <p>Job: {job?.name || 'N/A'}</p>
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep5Summary
