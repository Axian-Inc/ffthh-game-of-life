import ModalBackdrop from './ModalBackdrop'
import NewGameWizard from '../forms/NewGameWizard'

const CreateGameModal = ({
  isOpen,
  onBackdropClick,
  onCancel,
  onSubmit,
  gameName,
  onGameNameChange,
  players,
  draftPlayer,
  onAddPlayer,
  onDraftNameChange,
  createError,
  isCreating,
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick} onRequestClose={onCancel}>
      <NewGameWizard
        players={players}
        draftPlayer={draftPlayer}
        onDraftNameChange={onDraftNameChange}
        onAddPlayer={onAddPlayer}
        onSubmit={onSubmit}
        onGameNameChange={onGameNameChange}
        onClose={onCancel}
        createError={createError}
        isCreating={isCreating}
      />
    </ModalBackdrop>
  )
}

export default CreateGameModal
