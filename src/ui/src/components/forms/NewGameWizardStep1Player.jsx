import PlayerAvatar from '../ui/PlayerAvatar'
import { PLAYER_AVATAR_OPTIONS } from '../../data/playerAvatars'

const NewGameWizardStep1Player = ({
  playerName,
  selectedAvatar,
  maxPlayerNameLength,
  nameError,
  disabled,
  onNameChange,
  onAvatarSelect,
}) => (
  <div className="wizard-step wizard-step-player">
    <label className="wizard-field" htmlFor="wizard-player-name">
      <span className="wizard-field-label">Player Name:</span>
      <input
        id="wizard-player-name"
        className="wizard-text-input"
        disabled={disabled}
        maxLength={maxPlayerNameLength}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Enter a distinct name..."
        type="text"
        value={playerName}
      />
    </label>
    {nameError ? (
      <p className="wizard-inline-error" role="alert">
        {nameError}
      </p>
    ) : null}
    <div className="wizard-persona-block">
      <p className="wizard-field-label wizard-persona-label">Choose Your Digital Persona:</p>
      <div className="wizard-persona-grid" role="list" aria-label="Persona choices">
        {PLAYER_AVATAR_OPTIONS.map((option) => (
          <button
            key={option.key}
            aria-label={`Choose ${option.label} persona`}
            className={`wizard-persona-option ${selectedAvatar === option.key ? 'is-selected' : ''}`}
            disabled={disabled}
            onClick={() => onAvatarSelect(option.key)}
            type="button"
          >
            <PlayerAvatar avatar={option.key} decorative />
          </button>
        ))}
      </div>
    </div>
  </div>
)

export default NewGameWizardStep1Player
