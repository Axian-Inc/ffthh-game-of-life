import SecondaryButton from '../ui/SecondaryButton'
import IconButton from '../ui/IconButton'

const PlayersSection = ({
  players,
  minPlayers,
  maxPlayerNameLength,
  playerTouched,
  getPlayerError,
  hasPlayerValidation,
  arePlayersValid,
  onAddPlayer,
  onRemovePlayer,
  onPlayerNameChange,
  onPlayerBlur,
  onRandomizeAvatar,
  isCreating,
}) => (
  <div className="players-section">
    <div className="players-header">
      <div>
        <span>Players</span>
        <p className="players-summary">
          {players.length} players (minimum {minPlayers})
        </p>
      </div>
      <SecondaryButton onClick={onAddPlayer} disabled={isCreating}>
        Add player
      </SecondaryButton>
    </div>
    <div className="players-list">
      {players.map((player) => {
        const playerError = getPlayerError(player)
        const showError = playerTouched[player.id] && playerError
        return (
          <div className="player-row" key={player.id}>
            <div className="player-avatar">
              <span aria-hidden="true">{player.avatar}</span>
              <IconButton
                type="button"
                onClick={() => onRandomizeAvatar(player.id)}
                aria-label={`Randomize avatar for ${player.name || 'player'}`}
                disabled={isCreating}
              >
                🎲
              </IconButton>
            </div>
            <label className="field player-field">
              <span>Player name</span>
              <input
                type="text"
                placeholder="Player name"
                maxLength={maxPlayerNameLength}
                value={player.name}
                onChange={(event) => onPlayerNameChange(player.id, event.target.value)}
                onBlur={() => onPlayerBlur(player.id)}
                aria-invalid={Boolean(showError)}
                disabled={isCreating}
              />
              {showError ? <span className="field-error">{playerError}</span> : null}
            </label>
            <IconButton
              className="remove"
              type="button"
              onClick={() => onRemovePlayer(player.id)}
              aria-label={`Remove ${player.name || 'player'}`}
              disabled={players.length <= minPlayers || isCreating}
            >
              ✕
            </IconButton>
          </div>
        )
      })}
    </div>
    {!arePlayersValid && hasPlayerValidation ? (
      <p className="field-error">Add at least {minPlayers} players with unique names.</p>
    ) : null}
  </div>
)

export default PlayersSection
