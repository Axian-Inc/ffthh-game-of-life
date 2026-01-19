import ModalBackdrop from './ModalBackdrop'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const DeleteGameModal = ({ isOpen, game, onCancel, onConfirm, onBackdropClick }) => {
  if (!isOpen || !game) {
    return null
  }

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <div className="modal-card">
        <div className="modal-header">
          <p className="eyebrow">Delete Game</p>
          <h2>Remove “{game.name}”?</h2>
        </div>
        <p className="tagline">This will permanently remove the game session and its history.</p>
        <div className="modal-actions">
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onConfirm}>Delete game</PrimaryButton>
        </div>
      </div>
    </ModalBackdrop>
  )
}

export default DeleteGameModal
