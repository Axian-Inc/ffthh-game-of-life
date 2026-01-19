const GameCountBadge = ({ count, isLoading }) => (
  <span
    className="game-count"
    aria-label={isLoading ? 'Loading games' : `${count} games`}
  >
    {isLoading ? '...' : count}
  </span>
)

export default GameCountBadge
