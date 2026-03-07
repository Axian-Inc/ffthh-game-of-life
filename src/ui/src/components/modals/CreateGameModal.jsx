import ModalBackdrop from './ModalBackdrop'
import NewGameWizard from '../forms/NewGameWizard'
import '../forms/new-game-wizard.css'

const CreateGameModal = ({
  isOpen,
  onBackdropClick,
  onCancel,
  onSubmit,
  gameName,
  onGameNameChange,
  maxGameNameLength,
  players,
  maxPlayerNameLength,
  draftPlayer,
  onAddPlayer,
  onRemovePlayer,
  onDraftNameChange,
  onDraftAvatarCycle,
  isCreating,
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <NewGameWizard
        draftPlayer={draftPlayer}
        gameName={gameName}
        isCreating={isCreating}
        isOpen={isOpen}
        maxGameNameLength={maxGameNameLength}
        maxPlayerNameLength={maxPlayerNameLength}
        onAddPlayer={onAddPlayer}
        onCancel={onCancel}
        onDraftAvatarCycle={onDraftAvatarCycle}
        onDraftNameChange={onDraftNameChange}
        onGameNameChange={onGameNameChange}
        onRemovePlayer={onRemovePlayer}
        onSubmit={onSubmit}
        players={players}
      />
    </ModalBackdrop>
  )
}

export default CreateGameModal
