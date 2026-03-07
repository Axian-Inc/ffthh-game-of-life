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
  minPlayers,
  maxPlayerNameLength,
  draftPlayer,
  draftTouched,
  draftErrors,
  arePlayersValid,
  onAddPlayer,
  onRemovePlayer,
  onDraftNameChange,
  onDraftBlur,
  onDraftAvatarCycle,
  createError,
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
          maxGameNameLength={maxGameNameLength}
          players={players}
          minPlayers={minPlayers}
          maxPlayerNameLength={maxPlayerNameLength}
          draftPlayer={draftPlayer}
          draftTouched={draftTouched}
          draftErrors={draftErrors}
          arePlayersValid={arePlayersValid}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
          onDraftNameChange={onDraftNameChange}
          onDraftBlur={onDraftBlur}
          onDraftAvatarCycle={onDraftAvatarCycle}
          createError={createError}
          isCreating={isCreating}
        />
      </div>
    </ModalBackdrop>
  )
}

export default CreateGameModal
