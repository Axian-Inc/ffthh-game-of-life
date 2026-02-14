import ModalBackdrop from './ModalBackdrop'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const DeleteGameModal = ({ isOpen, game, onCancel, onConfirm, onBackdropClick }) => {
  if (!isOpen || !game) {
    return null
  }

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <div className="modal" data-test-id="delete-game-modal">
        <div className="modal-body">
          <p className="eyebrow">Delete Game</p>
          <h2 className="modal-title-dark">Remove “{game.name}”?</h2>
          <p className="tagline">
            This will permanently remove the game session and its history.
          </p>
        </div>
        <div className="modal-footer">
          <div className="modal-actions">
            <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
            <PrimaryButton onClick={onConfirm} data-test-id="confirm-delete-button">
              Delete game
            </PrimaryButton>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  )
}

export default DeleteGameModal
