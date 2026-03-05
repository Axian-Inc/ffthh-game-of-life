import PlayerAvatar from '../ui/PlayerAvatar'
import { PLAYER_AVATAR_OPTIONS } from '../../data/playerAvatars'

const NewGameWizardStep1Player = ({ draftPlayer, onNameChange, onAvatarSelect, isCreating, nameError }) => (
  <div className="wizard-step-content">
    <label className="wizard-text-field" htmlFor="wizard-player-name">
      <span className="wizard-field-label">Player Name</span>
      <input
        id="wizard-player-name"
        type="text"
        placeholder="Enter a distinct name..."
        value={draftPlayer.name}
        onChange={(event) => onNameChange(event.target.value)}
        disabled={isCreating}
        aria-invalid={Boolean(nameError)}
      />
    </label>
    {nameError ? <p className="wizard-error">{nameError}</p> : null}

    <p className="wizard-persona-label">Choose Your Digital Persona:</p>
    <div className="wizard-avatar-grid" role="group" aria-label="Digital persona options">
      {PLAYER_AVATAR_OPTIONS.map((option) => {
        const isSelected = draftPlayer.avatar === option.key
        return (
          <button
            key={option.key}
            type="button"
            className={`wizard-avatar-tile ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onAvatarSelect(option.key)}
            disabled={isCreating}
            aria-pressed={isSelected}
          >
            <PlayerAvatar avatar={option.key} decorative />
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep1Player
