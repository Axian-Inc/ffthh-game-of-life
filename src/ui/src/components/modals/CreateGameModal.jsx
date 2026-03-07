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
  maxGameNameLength,
  players,
  maxPlayerNameLength,
  draftPlayer,
  draftTouched,
  draftErrors,
  onAddPlayer,
  onRemovePlayer,
  onDraftNameChange,
  onDraftBlur,
  onDraftAvatarCycle,
  isCreating,
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick} className="wizard-backdrop" labelledBy="wizard-title">
      <NewGameWizard
        gameName={gameName}
        onGameNameChange={onGameNameChange}
        onGameNameBlur={onGameNameBlur}
        gameNameTouched={gameNameTouched}
        isGameNameValid={isGameNameValid}
        isGameNameTooLong={isGameNameTooLong}
        maxGameNameLength={maxGameNameLength}
        players={players}
        maxPlayerNameLength={maxPlayerNameLength}
        draftPlayer={draftPlayer}
        draftTouched={draftTouched}
        draftErrors={draftErrors}
        onAddPlayer={onAddPlayer}
        onRemovePlayer={onRemovePlayer}
        onDraftNameChange={(value) => onDraftNameChange({ target: { value } })}
        onDraftBlur={onDraftBlur}
        onDraftAvatarCycle={onDraftAvatarCycle}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isCreating={isCreating}
      />
    </ModalBackdrop>
  )
}

export default CreateGameModal
