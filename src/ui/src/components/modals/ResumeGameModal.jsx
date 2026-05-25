import ModalBackdrop from './ModalBackdrop'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const ResumeGameModal = ({ isOpen, game, mode, onBackdropClick, onClose }) => {
  if (!isOpen || !game) {
    return null
  }

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <div className="modal">
        <div className="modal-body">
          <p className="eyebrow">{mode === 'results' ? 'Game Results' : 'Resume Game'}</p>
          <h2 className="modal-title-dark">{game.name}</h2>
          <p className="tagline">
            {mode === 'results'
              ? `Reviewing the outcome for game ID ${game.id}. Results view is a placeholder.`
              : `Loading the last saved state for game ID ${game.id}. This is a placeholder for the session view.`}
          </p>
        </div>
        <div className="modal-footer">
          <div className="modal-actions">
            <SecondaryButton onClick={onClose}>Back to home</SecondaryButton>
            {mode === 'results' ? (
              <PrimaryButton onClick={onClose}>Start new game</PrimaryButton>
            ) : (
              <PrimaryButton type="button">Continue</PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </ModalBackdrop>
  )
}

export default ResumeGameModal
