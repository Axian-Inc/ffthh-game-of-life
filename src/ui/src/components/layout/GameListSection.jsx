import { LayoutGrid } from 'lucide-react'
import GameCountBadge from '../games/GameCountBadge'

const GameListSection = ({ count, isLoading, children }) => (
  <section className="game-list" aria-label="Game list">
    <div className="game-list-header">
      <div className="game-title">
        <span className="game-title-icon" aria-hidden="true">
          <LayoutGrid aria-hidden="true" />
        </span>
        <h2>Your Games</h2>
      </div>
      <GameCountBadge count={count} isLoading={isLoading} />
    </div>
    {children}
  </section>
)

export default GameListSection
