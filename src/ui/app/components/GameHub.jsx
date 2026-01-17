export function HubHeader({ onNewGame }) {
  return (
    <section className="hub-card">
      <div className="icon-wrap" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="img" aria-label="Game controller icon">
          <rect x="10" y="22" width="44" height="26" rx="12" />
          <rect x="18" y="30" width="12" height="4" rx="2" />
          <rect x="22" y="26" width="4" height="12" rx="2" />
          <circle cx="44" cy="32" r="3" />
          <circle cx="49" cy="28" r="2.5" />
        </svg>
      </div>
      <h1>Game Hub</h1>
      <p className="subtitle">
        Welcome! Pick up where you left off or start a fresh family-friendly
        adventure in Game of Life.
      </p>
      <button type="button" className="new-game" onClick={onNewGame}>
        + New Game
      </button>
    </section>
  );
}

export function GamesSection({ games, onResume, onDelete }) {
  return (
    <section className="games">
      <div className="games-header">
        <h2>Your Games</h2>
        <span className="count-badge" aria-label={`${games.length} games`}>
          {games.length}
        </span>
      </div>
      <div className="games-grid">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onResume={() => onResume(game)}
            onDelete={() => onDelete(game)}
          />
        ))}
      </div>
    </section>
  );
}

function GameCard({ game, onResume, onDelete }) {
  return (
    <article className="game-card">
      <div className="game-card-top">
        <span className={`status ${game.status}`}>{game.status}</span>
        <span className="players" aria-label={`${game.players} players`}>
          🎮 {game.players}
        </span>
      </div>
      <h3>{game.name}</h3>
      <p className="activity">{game.lastActive}</p>
      <div className="avatars" aria-hidden="true">
        {game.avatars.map((avatar, index) => (
          <span key={`${game.id}-${index}`} className="avatar">
            {avatar}
          </span>
        ))}
      </div>
      <div className="card-actions">
        <button type="button" className="resume" onClick={onResume}>
          <span className="play-icon" aria-hidden="true">
            ▶
          </span>
          Resume
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={onDelete}
          aria-label={`Delete ${game.name}`}
        >
          🗑️
        </button>
      </div>
    </article>
  );
}

export function NewGameModal({
  open,
  onClose,
  onStart,
  gameName,
  onGameNameChange,
  players,
  onAddPlayer,
  canAddPlayer,
  canStartGame,
  onShuffleAvatar,
  onUpdatePlayer
}) {
  if (!open) {
    return null;
  }

  return (
    <ModalBackdrop>
      <section
        className="modal new-game-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-game-title"
      >
        <header className="modal-header">
          <div className="modal-title">
            <span className="modal-icon" aria-hidden="true">
              🎮
            </span>
            <div>
              <h2 id="new-game-title">New Game</h2>
              <p>Let’s get the fun started!</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close new game modal"
          >
            ×
          </button>
        </header>
        <div className="modal-body">
          <p>
            Set up your next Game of Life session. Choose a grid size and
            pattern to begin.
          </p>
          <LabeledInput
            id="game-name"
            label="Game Name"
            value={gameName}
            onChange={onGameNameChange}
            placeholder="Family Game Night"
          />
          <PlayersSection
            players={players}
            onAddPlayer={onAddPlayer}
            canAddPlayer={canAddPlayer}
            onShuffleAvatar={onShuffleAvatar}
            onUpdatePlayer={onUpdatePlayer}
          />
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="primary"
            disabled={!canStartGame}
            onClick={onStart}
          >
            Start Game with {players.length} Players
          </button>
        </div>
        {!canStartGame ? (
          <p className="helper-text">Add at least one player to start</p>
        ) : null}
      </section>
    </ModalBackdrop>
  );
}

export function DeleteGameModal({ game, onCancel, onConfirm }) {
  if (!game) {
    return null;
  }

  return (
    <ModalBackdrop>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-game-title"
      >
        <h2 id="delete-game-title">Delete game?</h2>
        <p>
          This will remove <strong>{game.name}</strong> from your dashboard. You
          can’t undo this action.
        </p>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </section>
    </ModalBackdrop>
  );
}

function ModalBackdrop({ children }) {
  return (
    <div className="modal-backdrop" role="presentation">
      {children}
    </div>
  );
}

function PlayersSection({
  players,
  onAddPlayer,
  canAddPlayer,
  onShuffleAvatar,
  onUpdatePlayer
}) {
  return (
    <div className="players-section">
      <div className="players-header">
        <span>Players ({players.length})</span>
        <button
          type="button"
          className="ghost"
          onClick={onAddPlayer}
          disabled={!canAddPlayer}
        >
          <span className="icon" aria-hidden="true">
            👤+
          </span>
          Add Player
        </button>
      </div>
      <div className="players-list">
        {players.length === 0 ? (
          <p className="empty-state">
            No players yet. Add your first player to get started.
          </p>
        ) : null}
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onShuffleAvatar={() => onShuffleAvatar(player.id)}
            onUpdatePlayer={onUpdatePlayer}
          />
        ))}
      </div>
    </div>
  );
}

function PlayerCard({ player, onShuffleAvatar, onUpdatePlayer }) {
  return (
    <div className="player-card">
      <button
        type="button"
        className="avatar-button"
        onClick={onShuffleAvatar}
        aria-label="Shuffle avatar"
      >
        <span className="avatar-large">{player.avatar}</span>
      </button>
      <p className="avatar-hint">Click to shuffle avatar</p>
      <LabeledInput
        id={`nickname-${player.id}`}
        label="Nickname"
        value={player.nickname}
        onChange={(event) =>
          onUpdatePlayer(player.id, "nickname", event.target.value)
        }
        placeholder="Player nickname"
      />
      <LabeledInput
        id={`email-${player.id}`}
        label="Email"
        type="email"
        value={player.email}
        onChange={(event) =>
          onUpdatePlayer(player.id, "email", event.target.value)
        }
        placeholder="player@example.com"
      />
    </div>
  );
}

function LabeledInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}
