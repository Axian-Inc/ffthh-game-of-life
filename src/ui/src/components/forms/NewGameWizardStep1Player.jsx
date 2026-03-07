import PlayerAvatar from '../ui/PlayerAvatar'

const NewGameWizardStep1Player = ({
  playerName,
  onPlayerNameChange,
  selectedAvatar,
  onAvatarChange,
  avatarOptions,
  maxPlayerNameLength,
  playerNameError,
}) => (
  <div className="wizard-step" data-step="2">
    <label className="wizard-field" htmlFor="wizard-player-name-input">
      <span className="wizard-field-label">Player Name:</span>
      <input
        id="wizard-player-name-input"
        className="wizard-text-input"
        type="text"
        value={playerName}
        maxLength={maxPlayerNameLength}
        onChange={(event) => onPlayerNameChange(event.target.value)}
        placeholder="Enter player name"
        aria-invalid={Boolean(playerNameError)}
      />
    </label>
    {playerNameError ? <p className="wizard-field-error">{playerNameError}</p> : null}

    <div className="wizard-field-group">
      <p className="wizard-field-label">Choose Your Digital Persona:</p>
      <div className="wizard-avatar-grid" role="group" aria-label="Choose Your Digital Persona">
        {avatarOptions.map((option) => {
          const isSelected = option.key === selectedAvatar
          return (
            <button
              key={option.key}
              type="button"
              className={`wizard-avatar-button${isSelected ? ' is-selected' : ''}`}
              onClick={() => onAvatarChange(option.key)}
              aria-label={option.label}
              aria-pressed={isSelected}
            >
              <PlayerAvatar avatar={option.key} decorative />
            </button>
          )
        })}
      </div>
    </div>
  </div>
)

export default NewGameWizardStep1Player
