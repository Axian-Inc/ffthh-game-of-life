import PrimaryButton from '../ui/PrimaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import { PLAYER_AVATAR_OPTIONS } from '../../data/playerAvatars'

const NewGameWizardStep1Player = ({
  draftPlayer,
  draftTouched,
  draftErrors,
  maxPlayerNameLength,
  onDraftNameChange,
  onDraftBlur,
  onAvatarSelect,
  onNext,
}) => {
  const showNameError = draftTouched.name && draftErrors.name

  return (
    <div className="wizard-step" data-step="2">
      <header className="wizard-heading">
        <h2 className="wizard-title">New Player Setup</h2>
        <p className="wizard-subtitle">Step 2 of 6</p>
      </header>
      <div className="wizard-player-body">
        <label className="wizard-field" htmlFor="wizard-player-name">
          <span>Player Name:</span>
          <input
            id="wizard-player-name"
            type="text"
            value={draftPlayer.name}
            maxLength={maxPlayerNameLength}
            placeholder="Enter a distinct name..."
            onChange={onDraftNameChange}
            onBlur={() => onDraftBlur('name')}
            aria-invalid={Boolean(showNameError)}
          />
        </label>
        {showNameError ? (
          <p className="wizard-inline-error" role="alert">
            {draftErrors.name}
          </p>
        ) : null}
        <section className="wizard-avatar-section" aria-label="Choose Your Digital Persona">
          <h3 className="wizard-section-label">Choose Your Digital Persona:</h3>
          <div className="wizard-avatar-grid">
            {PLAYER_AVATAR_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`wizard-avatar-choice ${draftPlayer.avatar === option.key ? 'is-selected' : ''}`}
                onClick={() => onAvatarSelect(option.key)}
                aria-label={option.label}
                aria-pressed={draftPlayer.avatar === option.key}
              >
                <PlayerAvatar avatar={option.key} decorative />
              </button>
            ))}
          </div>
        </section>
      </div>
      <footer className="wizard-footer wizard-footer-center">
        <PrimaryButton className="wizard-pill-button" disabled={Boolean(draftErrors.name)} onClick={onNext}>
          Next
        </PrimaryButton>
      </footer>
    </div>
  )
}

export default NewGameWizardStep1Player
