import { Sparkles, UserPlus } from 'lucide-react'
import SecondaryButton from '../ui/SecondaryButton'
import PrimaryButton from '../ui/PrimaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import { WIZARD_CAREER_BY_ID, WIZARD_CITY_BY_ID } from '../../data/wizardVisualCatalog'

const NewGameWizardStep6Summary = ({
  gameName,
  difficultyMode,
  worldSettings,
  players,
  onAddPlayer,
  onStart,
  isStartDisabled,
  isSubmitting,
  submitError,
}) => (
  <div className="wizard-step wizard-step-summary" data-step="6">
    <section className="wizard-summary-card" aria-label="New game summary">
      <div className="wizard-summary-heading">
        <p className="wizard-summary-label">Game Name</p>
        <h3>{gameName}</h3>
        <p className="wizard-summary-meta">
          {players.length} player{players.length === 1 ? '' : 's'}
        </p>
        <p className="wizard-summary-settings">
          Difficulty: {difficultyMode.replace(/^./, (char) => char.toUpperCase())}
        </p>
        <p className="wizard-summary-settings">
          Settings: {Object.values(worldSettings).join(' / ').replace(/-/g, ' ')}
        </p>
      </div>
      <div className="wizard-summary-list">
        {players.map((player) => {
          const city = WIZARD_CITY_BY_ID[player.cityId]
          const job = WIZARD_CAREER_BY_ID[player.jobId]
          return (
            <div key={player.id} className="wizard-summary-player">
              <span className="wizard-summary-avatar" aria-hidden="true">
                <PlayerAvatar avatar={player.avatar} decorative />
              </span>
              <div>
                <strong>{player.name}</strong>
                <p>
                  {city?.icon} {city?.shortName || player.cityId} &bull; {job?.icon} {job?.title || player.jobId}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
    <div className="wizard-summary-actions">
      <SecondaryButton className="wizard-outline-button" onClick={onAddPlayer}>
        <UserPlus aria-hidden="true" />
        Add Player
      </SecondaryButton>
      <PrimaryButton className="wizard-action-button wizard-start-button" onClick={onStart} disabled={isStartDisabled}>
        <Sparkles aria-hidden="true" />
        {isSubmitting ? 'Starting...' : 'Start Game'}
      </PrimaryButton>
    </div>
    {submitError ? (
      <p className="wizard-field-error wizard-summary-error" role="alert">
        {submitError}
      </p>
    ) : null}
  </div>
)

export default NewGameWizardStep6Summary
