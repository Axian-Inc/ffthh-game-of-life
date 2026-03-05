import PlayerAvatar from '../ui/PlayerAvatar'

const NewGameWizardStep1Player = ({
  draftPlayer,
  draftError,
  maxPlayerNameLength,
  onDraftNameChange,
  onDraftAvatarCycle,
  isCreating,
}) => (
  <section className="wizard-step">
    <h3 className="wizard-title">New Player</h3>
    <p className="wizard-subtitle">Choose an avatar and enter a player name.</p>

    <div className="wizard-avatar-row">
      <button
        className="wizard-avatar-picker"
        type="button"
        onClick={onDraftAvatarCycle}
        disabled={isCreating}
        aria-label="Cycle avatar"
      >
        <PlayerAvatar avatar={draftPlayer.avatar} decorative />
      </button>
      <span className="wizard-avatar-help">Tap avatar to cycle options</span>
    </div>

    <label className="wizard-field" htmlFor="wizard-player-name">
      <span>Player Name</span>
      <input
        id="wizard-player-name"
        type="text"
        value={draftPlayer.name}
        onChange={onDraftNameChange}
        maxLength={maxPlayerNameLength}
        placeholder="Ari"
        autoComplete="off"
        aria-invalid={Boolean(draftError)}
        disabled={isCreating}
      />
    </label>

    {draftError ? <p className="field-error">{draftError}</p> : null}
  </section>
)

export default NewGameWizardStep1Player
