const GameCountBadge = ({ count, isLoading }) => (
  <span
    className="game-count"
    aria-label={isLoading ? 'Loading games' : `${count} games`}
  >
    {isLoading ? '...' : String(count)}
  </span>
)

export default GameCountBadge
