import ModalBackdrop from './ModalBackdrop'
import NewGameWizard from '../forms/NewGameWizard'

const CreateGameModal = ({
  isOpen,
  onBackdropClick,
  onCancel,
  onSubmit,
  gameName,
  onGameNameChange,
  onGameNameBlur,
  gameNameTouched,
  isGameNameValid,
  isGameNameTooLong,
  players,
  draftPlayer,
  draftTouched,
  draftErrors,
  onAddPlayer,
  onDraftNameChange,
  onDraftBlur,
  onDraftAvatarSelect,
  onDraftAvatarCycle,
  isCreating,
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <div className="modal wizard-modal">
        <NewGameWizard
          onCancel={onCancel}
          onSubmit={onSubmit}
          gameName={gameName}
          onGameNameChange={onGameNameChange}
          onGameNameBlur={onGameNameBlur}
          gameNameTouched={gameNameTouched}
          isGameNameValid={isGameNameValid}
          isGameNameTooLong={isGameNameTooLong}
          players={players}
          draftPlayer={draftPlayer}
          draftTouched={draftTouched}
          draftErrors={draftErrors}
          onAddPlayer={onAddPlayer}
          onDraftNameChange={onDraftNameChange}
          onDraftBlur={onDraftBlur}
          onDraftAvatarSelect={onDraftAvatarSelect}
          onDraftAvatarCycle={onDraftAvatarCycle}
          isCreating={isCreating}
        />
      </div>
    </ModalBackdrop>
  )
}

export default CreateGameModal
