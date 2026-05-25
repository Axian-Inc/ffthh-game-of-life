import { formatRelativeTime } from '../../utils/formatRelativeTime'
import AvatarRow from './AvatarRow'
import GameCardActions from './GameCardActions'
import StatusPill from './StatusPill'

const GameCard = ({
  game,
  now,
  isLoading,
  onResume,
  onViewResults,
  onDelete,
  resumeError,
  deleteError,
  isNew,
  newCardRef,
}) => (
  <div className="game-card" tabIndex={isNew ? -1 : undefined} ref={isNew ? newCardRef : undefined}>
    <div className="game-card-header">
      <h3>{game.name}</h3>
      <StatusPill status={game.status} />
    </div>
    <div className="game-card-meta">
      <span>{game.players.length} players</span>
      <span>{formatRelativeTime(game.lastUpdated, now)}</span>
    </div>
    <AvatarRow players={game.players} />
    <GameCardActions
      game={game}
      isLoading={isLoading}
      onResume={onResume}
      onViewResults={onViewResults}
      onDelete={onDelete}
    />
    {resumeError ? (
      <p className="resume-error" role="alert">
        {resumeError}
      </p>
    ) : null}
    {deleteError ? (
      <p className="delete-error" role="alert">
        {deleteError}
      </p>
    ) : null}
  </div>
)

export default GameCard
