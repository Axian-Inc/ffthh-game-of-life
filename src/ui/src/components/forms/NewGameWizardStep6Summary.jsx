import PlayerAvatar from '../ui/PlayerAvatar'

const NewGameWizardStep6Summary = ({
  players,
  cityById,
  trackById,
  jobById,
  gameName,
  onGameNameChange,
  onGameNameBlur,
}) => (
  <div className="wizard-step wizard-step-summary" data-step="6">
    <div className="wizard-summary-header">
      <label className="wizard-form-label" htmlFor="summary-game-name">
        Game Name:
      </label>
      <input
        id="summary-game-name"
        className="wizard-input"
        type="text"
        maxLength={60}
        value={gameName}
        onChange={onGameNameChange}
        onBlur={onGameNameBlur}
      />
    </div>

    <div className="wizard-summary-sheet">
      {players.map((player) => {
        const city = cityById[player.cityId]
        const track = trackById[player.educationTrackId]
        const job = jobById[player.jobId]
        return (
          <article className="wizard-summary-row" key={player.id}>
            <div className="wizard-summary-cell wizard-summary-player">
              <span className="wizard-summary-avatar" aria-hidden="true">
                <PlayerAvatar avatar={player.avatar} decorative />
              </span>
              <p>
                <strong>Name:</strong> {player.name}
                <br />
                <strong>City:</strong> {city?.label || '-'}
              </p>
            </div>
            <div className="wizard-summary-cell">
              <span className="wizard-summary-emoji" aria-hidden="true">
                {city?.icon || '📍'}
              </span>
            </div>
            <div className="wizard-summary-cell">
              <p>
                <strong>Education:</strong>
                <br />
                {track?.label || '-'}
              </p>
            </div>
            <div className="wizard-summary-cell">
              <span className="wizard-summary-emoji" aria-hidden="true">
                {track?.icon || '🎓'}
              </span>
            </div>
            <div className="wizard-summary-cell">
              <p>
                <strong>Job:</strong>
                <br />
                {job?.label || '-'}
              </p>
            </div>
            <div className="wizard-summary-cell">
              <span className="wizard-summary-emoji" aria-hidden="true">
                {job?.icon || '💼'}
              </span>
            </div>
          </article>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep6Summary
