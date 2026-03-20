import PlayerAvatar from '../ui/PlayerAvatar'
import PrimaryButton from '../ui/PrimaryButton'
import { ArrowRight } from 'lucide-react'

const NewGameWizardStep1Player = ({
  playerName,
  onPlayerNameChange,
  selectedAvatar,
  onAvatarChange,
  avatarOptions,
  maxPlayerNameLength,
  playerNameError,
  onNext,
  isNextDisabled,
}) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !isNextDisabled) {
      event.preventDefault()
      onNext()
    }
  }

  return (
    <div className="wizard-step" data-step="2">
      <input
        id="wizard-player-name-input"
        className="wizard-text-input"
        type="text"
        value={playerName}
        maxLength={maxPlayerNameLength}
        onChange={(event) => onPlayerNameChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nickname"
        aria-invalid={Boolean(playerNameError)}
        aria-label="Nickname"
        data-autofocus="true"
      />
      {playerNameError ? <p className="wizard-field-error">{playerNameError}</p> : null}

      <div className="wizard-avatar-grid" role="group" aria-label="Choose avatar">
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
      <PrimaryButton className="wizard-action-button" onClick={onNext} disabled={isNextDisabled}>
        Next <ArrowRight aria-hidden="true" />
      </PrimaryButton>
    </div>
  )
}

export default NewGameWizardStep1Player
