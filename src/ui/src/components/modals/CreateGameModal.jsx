import ModalBackdrop from './ModalBackdrop'
import NewGameWizard from '../forms/NewGameWizard'

const CreateGameModal = ({ isOpen, onCancel, onSubmit, submitError, isSubmitting, onStatusChange }) => {
  if (!isOpen) {
    return null
  }

  return (
    <ModalBackdrop>
      <NewGameWizard
        onCancel={onCancel}
        onSubmit={onSubmit}
        submitError={submitError}
        isSubmitting={isSubmitting}
        onStatusChange={onStatusChange}
      />
    </ModalBackdrop>
  )
}

export default CreateGameModal
