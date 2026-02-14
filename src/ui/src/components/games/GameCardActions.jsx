import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import { Trash2 } from 'lucide-react'

const GameCardActions = ({
  game,
  isLoading,
  onResume,
  onViewResults,
  onDelete,
}) => (
  <div className="game-card-actions">
    <PrimaryButton
      onClick={() => (game.status === 'completed' ? onViewResults(game) : onResume(game))}
      disabled={isLoading || game.status === 'paused'}
      data-test-id={game.status === 'completed' ? 'view-results-button' : 'resume-game-button'}
    >
      {game.status === 'completed' ? 'View results' : 'Resume'}
    </PrimaryButton>
    <SecondaryButton
      onClick={() => onDelete(game)}
      aria-label={`Delete ${game.name}`}
      disabled={isLoading}
      data-test-id="delete-game-button"
    >
      <Trash2 aria-hidden="true" />
    </SecondaryButton>
  </div>
)

export default GameCardActions
