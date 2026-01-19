import PrimaryButton from '../ui/PrimaryButton'

const GameErrorState = ({ message, onRetry }) => (
  <div className="game-error" role="alert">
    <p>{message}</p>
    <PrimaryButton onClick={onRetry}>Retry</PrimaryButton>
  </div>
)

export default GameErrorState
