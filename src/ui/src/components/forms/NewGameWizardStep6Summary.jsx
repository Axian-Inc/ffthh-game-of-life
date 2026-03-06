import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import {
  getWizardCityOption,
  getWizardJobOption,
  getWizardTrackOption,
} from '../../data/wizardVisualCatalog'

const SummaryRow = ({ player }) => {
  const city = getWizardCityOption(player.cityId)
  const track = getWizardTrackOption(player.educationTrackId)
  const job = getWizardJobOption(player.jobId)

  return (
    <div className="wizard-summary-row">
      <div className="wizard-summary-identity">
        <span className="wizard-summary-avatar" aria-hidden="true">
          <PlayerAvatar avatar={player.avatar} decorative />
        </span>
        <div>
          <p>
            <strong>Name:</strong> {player.name}
          </p>
          <p>
            <strong>City:</strong> {city?.label}
          </p>
        </div>
      </div>
      <div className="wizard-summary-pill">
        <span>{city?.badge}</span>
      </div>
      <div className="wizard-summary-meta">
        <p>
          <strong>Education:</strong> {track?.label}
        </p>
      </div>
      <div className="wizard-summary-meta">
        <p>
          <strong>Job:</strong> {job?.label}
        </p>
      </div>
    </div>
  )
}

const NewGameWizardStep6Summary = ({
  gameName,
  maxGameNameLength,
  onGameNameChange,
  onGameNameBlur,
  players,
  canStartGame,
  isCreating,
  onAddAnotherPlayer,
  onStartGame,
}) => (
  <div className="wizard-step wizard-step-summary" data-step="6">
    <header className="wizard-heading">
      <h2 className="wizard-title">New Game - Summary</h2>
      <p className="wizard-subtitle">Step 6 of 6</p>
    </header>
    <div className="wizard-summary-sheet">
      <label className="wizard-summary-name" htmlFor="wizard-summary-game-name">
        <span>Game Name:</span>
        <input
          id="wizard-summary-game-name"
          type="text"
          value={gameName}
          maxLength={maxGameNameLength}
          onChange={onGameNameChange}
          onBlur={onGameNameBlur}
        />
      </label>
      <div className="wizard-summary-list">
        {players.map((player) => (
          <SummaryRow key={player.id} player={player} />
        ))}
      </div>
    </div>
    <footer className="wizard-footer wizard-footer-summary">
      <SecondaryButton className="wizard-secondary-button" onClick={onAddAnotherPlayer}>
        + New Player
      </SecondaryButton>
      <PrimaryButton className="wizard-pill-button" disabled={!canStartGame || isCreating} onClick={onStartGame}>
        {isCreating ? 'Creating...' : 'Start Game'}
      </PrimaryButton>
    </footer>
  </div>
)

export default NewGameWizardStep6Summary
