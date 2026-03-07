import PlayerAvatar from '../ui/PlayerAvatar'
import {
  getWizardCityById,
  getWizardJobById,
  getWizardTrackById,
} from '../../data/wizardVisualCatalog'

const NewGameWizardStep6Summary = ({
  gameName,
  maxGameNameLength,
  players,
  disabled,
  nameError,
  onNameChange,
}) => (
  <div className="wizard-step wizard-step-summary">
    <div className="wizard-summary-sheet">
      <div className="wizard-summary-header">
        <label className="wizard-summary-name" htmlFor="wizard-summary-name">
          <span>Game Name:</span>
          <input
            id="wizard-summary-name"
            className="wizard-summary-input"
            disabled={disabled}
            maxLength={maxGameNameLength}
            onChange={(event) => onNameChange(event.target.value)}
            type="text"
            value={gameName}
          />
        </label>
        {nameError ? (
          <p className="wizard-inline-error" role="alert">
            {nameError}
          </p>
        ) : null}
      </div>
      <div className="wizard-summary-rows">
        {players.map((player) => {
          const city = getWizardCityById(player.cityId)
          const track = getWizardTrackById(player.educationTrackId)
          const job = getWizardJobById(player.jobId)
          return (
            <article className="wizard-summary-row" key={player.id}>
              <div className="wizard-summary-cell wizard-summary-player">
                <span className="wizard-summary-avatar">
                  <PlayerAvatar avatar={player.avatar} decorative />
                </span>
                <div>
                  <p>
                    <strong>Name:</strong> {player.name}
                  </p>
                  <p>
                    <strong>City:</strong> {city.title}
                  </p>
                </div>
              </div>
              <div className="wizard-summary-cell wizard-summary-detail">
                <img alt="" aria-hidden="true" src={track.icons[0]} />
                <div>
                  <p className="wizard-summary-detail-label">Education:</p>
                  <p>{track.title}</p>
                </div>
              </div>
              <div className="wizard-summary-cell wizard-summary-detail">
                <img alt="" aria-hidden="true" src={job.icon} />
                <div>
                  <p className="wizard-summary-detail-label">Job:</p>
                  <p>{job.title}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  </div>
)

export default NewGameWizardStep6Summary
