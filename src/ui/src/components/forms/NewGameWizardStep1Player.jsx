import { PLAYER_AVATAR_OPTIONS } from '../../data/playerAvatars'
import PlayerAvatar from '../ui/PlayerAvatar'
import PrimaryButton from '../ui/PrimaryButton'

const NewGameWizardStep1Player = ({
  player,
  playerNameError,
  onNameChange,
  onAvatarChange,
  onNext,
  canAdvance,
}) => (
  <div className="wizard-step-panel wizard-step-panel-medium">
    <div className="wizard-step-body">
      <label className="wizard-field-stack" htmlFor="wizard-player-name">
        <span className="wizard-field-label">Player Name:</span>
        <input
          id="wizard-player-name"
          className="wizard-text-input"
          type="text"
          placeholder="Enter a distinct name..."
          value={player.name}
          onChange={(event) => onNameChange(event.target.value)}
          aria-invalid={Boolean(playerNameError)}
        />
      </label>
      {playerNameError ? <p className="field-error wizard-inline-error">{playerNameError}</p> : null}
      <div className="wizard-field-stack">
        <span className="wizard-field-label">Choose Your Digital Persona:</span>
        <div className="wizard-avatar-grid" role="list">
          {PLAYER_AVATAR_OPTIONS.map((option) => {
            const isSelected = option.key === player.avatar
            return (
              <button
                key={option.key}
                type="button"
                aria-label={option.label}
                aria-pressed={isSelected}
                className={`wizard-avatar-button ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onAvatarChange(option.key)}
              >
                <PlayerAvatar avatar={option.key} className="wizard-avatar-icon" decorative />
              </button>
            )
          })}
        </div>
      </div>
    </div>
    <div className="wizard-footer wizard-footer-center">
      <PrimaryButton className="wizard-pill-button" disabled={!canAdvance} onClick={onNext}>
        Next
      </PrimaryButton>
    </div>
  </div>
)

export default NewGameWizardStep1Player
