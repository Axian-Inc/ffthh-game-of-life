import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export interface GameSummary {
  id: string;
  name: string;
  playerCount: number;
  lastActiveLabel: string;
  status?: "active" | "paused" | "archived";
  avatars: string[];
}

interface HomeScreenProps {
  games: GameSummary[];
  onNewGame: () => void;
  onResume: (gameId: string) => void;
  onDelete: (gameId: string) => void;
}

const playerLabel = (count: number) =>
  count === 1 ? "1 player" : `${count} players`;

export default function HomeScreen({
  games,
  onNewGame,
  onResume,
  onDelete
}: HomeScreenProps) {
  return (
    <div className="page">
      <div className="container stack stack-lg">
        <header className="stack center header-stack">
          <div className="app-icon" aria-hidden="true">
            🎮
          </div>
          <h1 className="h1">Game Hub</h1>
          <p className="subtitle">
            Family fun starts here. Choose a game to resume or launch a new
            adventure for everyone in the house.
          </p>
          <button className="btn btn-primary" onClick={onNewGame}>
            New Game
          </button>
        </header>

        <section className="stack">
          <div className="section-title">
            <h2 className="section-title-text">Your Games</h2>
            <span className="badge-count">{games.length}</span>
          </div>

          <div className="cards-grid">
            {games.map((game) => (
              <article key={game.id} className="card" data-testid="game-card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{game.name}</h3>
                    <div className="card-meta">
                      <span>{playerLabel(game.playerCount)}</span>
                      <span className="meta-time">
                        <AccessTimeIcon
                          fontSize="small"
                          aria-hidden="true"
                          data-testid="last-active-icon"
                        />
                        {game.lastActiveLabel}
                      </span>
                    </div>
                  </div>
                  {game.status === "active" ? (
                    <span className="status-pill">active</span>
                  ) : null}
                </div>

                <div className="avatar-row">
                  {game.avatars.map((avatar, index) => (
                    <span
                      key={`${game.id}-${index}`}
                      className="avatar"
                      data-testid="player-avatar"
                      aria-hidden="true"
                    >
                      {avatar}
                    </span>
                  ))}
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => onResume(game.id)}
                  >
                    <PlayArrowIcon fontSize="small" />
                    Resume
                  </button>
                  <button
                    className="icon-btn"
                    aria-label="Delete"
                    onClick={() => onDelete(game.id)}
                  >
                    <DeleteOutlineIcon />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
