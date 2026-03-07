import ModalBackdrop from './ModalBackdrop'
import NewGameWizard from '../forms/NewGameWizard'

const CreateGameModal = ({ isOpen, onBackdropClick, onCancel, onSubmit, gameName }) => {
  if (!isOpen) {
    return null
  }

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <NewGameWizard initialGameName={gameName} onCancel={onCancel} onSubmit={onSubmit} />
    </ModalBackdrop>
  )
}

export default CreateGameModal
