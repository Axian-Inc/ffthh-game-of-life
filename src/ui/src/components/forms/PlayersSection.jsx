import SecondaryButton from '../ui/SecondaryButton'
import IconButton from '../ui/IconButton'
import PlayerAvatar from '../ui/PlayerAvatar'

const PlayersSection = ({
  players,
  minPlayers,
  maxPlayerNameLength,
  draftPlayer,
  draftTouched,
  draftErrors,
  arePlayersValid,
  onAddPlayer,
  onRemovePlayer,
  onDraftNameChange,
  onDraftBlur,
  onDraftAvatarCycle,
  isCreating,
}) => {
  const showNameError = draftTouched.name && draftErrors.name

  return (
    <div className="players-section">
      <div className="players-header">
        <div>
          <div className="players-title">Players ({players.length})</div>
        </div>
      </div>
      <div className="players-panel">
        <div className="player-entry-row">
          <button
            className="avatar-tile"
            type="button"
            onClick={onDraftAvatarCycle}
            aria-label="Click to change avatar"
            disabled={isCreating}
          >
            <PlayerAvatar avatar={draftPlayer.avatar} decorative />
          </button>
          <input
            type="text"
            className="player-name-input"
            aria-label="Player nickname"
            placeholder="Player nickname"
            maxLength={maxPlayerNameLength}
            value={draftPlayer.name}
            onChange={onDraftNameChange}
            onBlur={() => onDraftBlur('name')}
            aria-invalid={Boolean(showNameError)}
            disabled={isCreating}
          />
          <SecondaryButton className="btn-teal" onClick={onAddPlayer} disabled={isCreating}>
            Add Player
          </SecondaryButton>
        </div>
        {showNameError ? <span className="field-error">{draftErrors.name}</span> : null}
      </div>
      {players.length ? (
        <div className="players-added">
          {players.map((player) => (
            <div className="player-summary" key={player.id}>
              <div className="player-summary-info">
                <span className="player-summary-avatar" aria-hidden="true">
                  <PlayerAvatar avatar={player.avatar} decorative />
                </span>
                <div>
                  <div className="player-summary-name">{player.name}</div>
                </div>
              </div>
              <IconButton
                className="remove"
                type="button"
                onClick={() => onRemovePlayer(player.id)}
                aria-label={`Remove ${player.name || 'player'}`}
                disabled={isCreating}
              >
                ✕
              </IconButton>
            </div>
          ))}
        </div>
      ) : null}
      {!arePlayersValid && players.length >= minPlayers ? (
        <p className="field-error">Check player details before starting.</p>
      ) : null}
    </div>
  )
}

export default PlayersSection
