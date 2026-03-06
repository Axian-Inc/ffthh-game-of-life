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
      className="game-card-resume"
      onClick={() => (game.status === 'completed' ? onViewResults(game) : onResume(game))}
      disabled={isLoading || game.status === 'paused'}
    >
      {game.status === 'completed' ? 'View results' : 'Resume'}
    </PrimaryButton>
    <SecondaryButton
      className="game-card-delete"
      onClick={() => onDelete(game)}
      aria-label={`Delete ${game.name}`}
      disabled={isLoading}
    >
      <Trash2 aria-hidden="true" />
    </SecondaryButton>
  </div>
)

export default GameCardActions
