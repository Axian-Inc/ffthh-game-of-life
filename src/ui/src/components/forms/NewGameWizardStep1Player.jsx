import PlayerAvatar from '../ui/PlayerAvatar'

const NewGameWizardStep1Player = ({
  playerName,
  maxPlayerNameLength,
  playerNameError,
  selectedAvatar,
  avatarOptions,
  onPlayerNameChange,
  onPlayerNameBlur,
  onAvatarSelect,
  onBack,
  onNext,
}) => (
  <>
    <div className="wizard-step-body" data-testid="wizard-step-2">
      <label className="wizard-field" htmlFor="player-name">
        <span className="wizard-label">Player Name:</span>
        <input
          id="player-name"
          type="text"
          value={playerName}
          maxLength={maxPlayerNameLength}
          onChange={onPlayerNameChange}
          onBlur={onPlayerNameBlur}
          placeholder="Player nickname"
          aria-invalid={Boolean(playerNameError)}
        />
      </label>
      {playerNameError ? <p className="field-error">{playerNameError}</p> : null}

      <section className="wizard-persona-section" aria-label="Persona selection">
        <h3 className="wizard-label">Choose Your Digital Persona:</h3>
        <div className="wizard-persona-grid" role="radiogroup" aria-label="Choose your digital persona">
          {avatarOptions.map((option) => {
            const isSelected = option.key === selectedAvatar
            return (
              <button
                key={option.key}
                type="button"
                className={`wizard-avatar-option ${isSelected ? 'wizard-avatar-option-selected' : ''}`}
                onClick={() => onAvatarSelect(option.key)}
                role="radio"
                aria-checked={isSelected}
                aria-label={option.label}
              >
                <PlayerAvatar avatar={option.key} decorative />
              </button>
            )
          })}
        </div>
      </section>
    </div>
    <div className="wizard-footer">
      <button className="wizard-button wizard-button-secondary" onClick={onBack} type="button">
        Back
      </button>
      <button className="wizard-button wizard-button-primary" onClick={onNext} type="button">
        Next
      </button>
    </div>
  </>
)

export default NewGameWizardStep1Player
