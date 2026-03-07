import PlayerAvatar from '../ui/PlayerAvatar'

const NewGameWizardStep1Player = ({
  draftPlayer,
  draftErrors,
  draftTouched,
  onDraftNameChange,
  onDraftBlur,
  onAvatarSelect,
  avatars,
  isCreating,
}) => {
  const showNameError = draftTouched?.name && draftErrors?.name

  return (
    <div className="wizard-step wizard-step-2" data-step="2">
      <label className="wizard-form-label" htmlFor="player-name">
        Player Name:
      </label>
      <input
        id="player-name"
        className="wizard-input"
        maxLength={24}
        placeholder="Enter a distinct name..."
        type="text"
        value={draftPlayer.name}
        onBlur={onDraftBlur}
        onChange={onDraftNameChange}
        aria-invalid={Boolean(showNameError)}
        disabled={isCreating}
      />
      {showNameError ? <p className="wizard-error">{draftErrors.name}</p> : null}

      <p className="wizard-form-label wizard-avatar-label">Choose Your Digital Persona:</p>
      <div className="wizard-avatar-grid" role="listbox" aria-label="Choose Your Digital Persona">
        {avatars.map((avatar) => {
          const isSelected = avatar.key === draftPlayer.avatar
          return (
            <button
              key={avatar.key}
              type="button"
              className={`wizard-avatar-tile ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onAvatarSelect(avatar.key)}
              aria-label={avatar.label}
              aria-selected={isSelected}
              disabled={isCreating}
            >
              <PlayerAvatar avatar={avatar.key} decorative />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default NewGameWizardStep1Player
