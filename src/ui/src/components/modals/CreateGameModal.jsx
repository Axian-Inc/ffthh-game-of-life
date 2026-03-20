import ModalBackdrop from './ModalBackdrop'
import NewGameWizard from '../forms/NewGameWizard'

const CreateGameModal = ({ isOpen, onCancel, onSubmit, submitError, isSubmitting }) => {
  if (!isOpen) {
    return null
  }

  return (
    <ModalBackdrop>
      <NewGameWizard onCancel={onCancel} onSubmit={onSubmit} submitError={submitError} isSubmitting={isSubmitting} />
    </ModalBackdrop>
  )
}

export default CreateGameModal
