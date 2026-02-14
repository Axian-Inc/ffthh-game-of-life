import SecondaryButton from '../ui/SecondaryButton'
import IconButton from '../ui/IconButton'

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
  onDraftShuffle,
  isCreating,
}) => {
  const showNameError = draftTouched.name && draftErrors.name

  return (
    <div className="players-section">
      <div className="players-header">
        <div>
          <div className="players-title">Players ({players.length})</div>
          <p className="players-summary">Minimum {minPlayers} player</p>
        </div>
      </div>
      <div className="players-panel">
        <div className="player-avatar-row">
          <button
            className="avatar-tile"
            type="button"
            onClick={onDraftShuffle}
            aria-label="Shuffle avatar"
            disabled={isCreating}
            data-test-id="shuffle-avatar"
          >
            {draftPlayer.avatar}
          </button>
          <div className="avatar-hint">Click to shuffle avatar</div>
        </div>
        <label className="field">
          <span>Nickname</span>
          <input
            type="text"
            placeholder="Player nickname"
            maxLength={maxPlayerNameLength}
            value={draftPlayer.name}
            onChange={onDraftNameChange}
            onBlur={() => onDraftBlur('name')}
            aria-invalid={Boolean(showNameError)}
            disabled={isCreating}
            data-test-id="player-name-input"
          />
          {showNameError ? <span className="field-error">{draftErrors.name}</span> : null}
        </label>
        <SecondaryButton className="btn-teal" onClick={onAddPlayer} disabled={isCreating} data-test-id="add-player-button">
          Add Player
        </SecondaryButton>
      </div>
      {players.length ? (
        <div className="players-added" data-test-id="players-list">
          {players.map((player) => (
            <div className="player-summary" key={player.id}>
              <div className="player-summary-info">
                <span className="player-summary-avatar" aria-hidden="true">
                  {player.avatar}
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
                data-test-id="remove-player-button"
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
