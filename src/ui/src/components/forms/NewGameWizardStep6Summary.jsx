import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import { getCityById, getEducationTrackById, getJobById } from '../../data/wizardVisualCatalog'

const SummaryRow = ({ player }) => {
  const city = getCityById(player.cityId)
  const education = getEducationTrackById(player.educationTrackId)
  const job = getJobById(player.educationTrackId, player.jobId)

  return (
    <article className="wizard-summary-row">
      <div className="wizard-summary-player">
        <span className="wizard-summary-avatar">
          <PlayerAvatar avatar={player.avatar} decorative />
        </span>
        <div className="wizard-summary-copy">
          <p>Name: {player.name}</p>
          <p>City: {city?.title || 'TBD'}</p>
        </div>
      </div>
      <div className="wizard-summary-meta">
        <span className="wizard-summary-icon-tile">
          {city ? <img alt="" src={city.artSrc} /> : null}
        </span>
        <div className="wizard-summary-copy">
          <p>Education:</p>
          <p>{education?.title || 'TBD'}</p>
        </div>
      </div>
      <div className="wizard-summary-meta">
        <span className="wizard-summary-icon-tile">
          {job ? <img alt="" src={job.artSrc} /> : null}
        </span>
        <div className="wizard-summary-copy">
          <p>Job:</p>
          <p>{job?.title || 'TBD'}</p>
        </div>
      </div>
    </article>
  )
}

const NewGameWizardStep6Summary = ({
  gameName,
  players,
  createError,
  isSubmitting,
  canAddPlayer,
  canStartGame,
  onAddPlayer,
  onGameNameChange,
  onStartGame,
}) => (
  <div className="wizard-step-panel wizard-step-panel-summary">
    <div className="wizard-summary-sheet">
      <div className="wizard-summary-header">
        <label className="wizard-summary-name-row" htmlFor="wizard-summary-name">
          <span>Game Name:</span>
          <input
            id="wizard-summary-name"
            className="wizard-summary-name-input"
            type="text"
            value={gameName}
            onChange={(event) => onGameNameChange(event.target.value)}
          />
        </label>
      </div>
      <div className="wizard-summary-list">
        {players.map((player) => (
          <SummaryRow key={player.id} player={player} />
        ))}
      </div>
    </div>
    <div className="wizard-footer wizard-footer-summary">
      <SecondaryButton className="wizard-summary-action" disabled={!canAddPlayer || isSubmitting} onClick={onAddPlayer}>
        + New Player
      </SecondaryButton>
      <PrimaryButton className="wizard-summary-action wizard-start-action" disabled={!canStartGame} onClick={onStartGame}>
        {isSubmitting ? 'Saving...' : 'Start Game'}
      </PrimaryButton>
    </div>
    {players.length < 2 ? <p className="wizard-summary-note">Add at least two players to start the game.</p> : null}
    {createError ? (
      <p className="field-error wizard-inline-error" role="alert">
        {createError}
      </p>
    ) : null}
  </div>
)

export default NewGameWizardStep6Summary
