import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import { PLAYER_AVATAR_OPTIONS } from '../../data/playerAvatars'

const NewGameWizardStep1Player = ({
  players,
  draftPlayer,
  draftTouched,
  draftErrors,
  maxPlayerNameLength,
  isCreating,
  editingPlayerId,
  onDraftNameChange,
  onDraftBlur,
  onSelectAvatar,
  onSelectPlayer,
  onAddPlayer,
  onRemovePlayer,
  onNext,
  onBack,
}) => {
  const hasPlayers = players.length > 0

  return (
    <div className="wizard-step wizard-step-player">
      <div className="wizard-player-fieldset">
        <label className="wizard-label" htmlFor="wizard-player-name">
          Player Name:
        </label>
        <input
          id="wizard-player-name"
          className="wizard-input"
          type="text"
          value={draftPlayer.name}
          maxLength={maxPlayerNameLength}
          placeholder="Player nickname"
          onChange={(event) => onDraftNameChange(event.target.value)}
          onBlur={() => onDraftBlur('name')}
          aria-invalid={Boolean(draftTouched.name && draftErrors.name)}
          disabled={isCreating}
        />
        {draftTouched.name && draftErrors.name ? (
          <p className="wizard-error" role="alert">
            {draftErrors.name}
          </p>
        ) : null}
      </div>

      <div className="wizard-player-fieldset">
        <p className="wizard-label wizard-label-static">Choose Your Digital Persona:</p>
        <div className="wizard-avatar-grid" role="radiogroup" aria-label="Choose Your Digital Persona">
          {PLAYER_AVATAR_OPTIONS.slice(0, 25).map((option) => {
            const selected = option.key === draftPlayer.avatar
            return (
              <button
                key={option.key}
                type="button"
                className={`wizard-avatar-option ${selected ? 'is-selected' : ''}`}
                aria-label={option.label}
                aria-pressed={selected}
                onClick={() => onSelectAvatar(option.key)}
                disabled={isCreating}
              >
                <PlayerAvatar avatar={option.key} decorative className="wizard-avatar-icon" />
              </button>
            )
          })}
        </div>
      </div>

      <div className="wizard-player-actions">
        <SecondaryButton className="wizard-add-player" onClick={onAddPlayer} disabled={isCreating}>
          + Add Player
        </SecondaryButton>
      </div>

      {hasPlayers ? (
        <ul className="wizard-player-list" aria-label="Configured Players">
          {players.map((player) => (
            <li key={player.id} className={`wizard-player-chip ${editingPlayerId === player.id ? 'is-active' : ''}`}>
              <button
                type="button"
                className="wizard-player-chip-main"
                onClick={() => onSelectPlayer(player.id)}
                disabled={isCreating}
              >
                <PlayerAvatar avatar={player.avatar} decorative className="wizard-player-chip-avatar" />
                <span>{player.name}</span>
              </button>
              <button
                type="button"
                className="wizard-player-chip-remove"
                aria-label={`Remove ${player.name}`}
                onClick={() => onRemovePlayer(player.id)}
                disabled={isCreating}
              >
                x
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="wizard-footer-row">
        <SecondaryButton onClick={onBack} disabled={isCreating}>
          Back
        </SecondaryButton>
        <PrimaryButton onClick={onNext} disabled={!hasPlayers || isCreating}>
          Next
        </PrimaryButton>
      </div>
    </div>
  )
}

export default NewGameWizardStep1Player
