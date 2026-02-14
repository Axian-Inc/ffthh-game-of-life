import GameCard from './GameCard'
import GameSkeletonCard from './GameSkeletonCard'

const GameGrid = ({
  games,
  isLoading,
  now,
  onResume,
  onViewResults,
  onDelete,
  resumeErrors,
  deleteErrors,
  newGameId,
  newGameCardRef,
}) => (
  <ul className="game-items" data-test-id="game-list">
    {isLoading
      ? Array.from({ length: 4 }).map((_, index) => (
          <li key={`skeleton-${index}`}>
            <GameSkeletonCard />
          </li>
        ))
      : games.map((game) => (
          <li key={game.id}>
            <GameCard
              game={game}
              now={now}
              isLoading={isLoading}
              onResume={onResume}
              onViewResults={onViewResults}
              onDelete={onDelete}
              resumeError={resumeErrors[game.id]}
              deleteError={deleteErrors[game.id]}
              isNew={game.id === newGameId}
              newCardRef={newGameCardRef}
            />
          </li>
        ))}
  </ul>
)

export default GameGrid
