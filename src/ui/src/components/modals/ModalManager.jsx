import CreateGameModal from './CreateGameModal'
import ResumeGameModal from './ResumeGameModal'
import DeleteGameModal from './DeleteGameModal'

const ModalManager = ({
  view,
  activeGame,
  activeGameMode,
  pendingDelete,
  onBackdropClick,
  onCloseAll,
  onDeleteCancel,
  onDeleteConfirm,
  createGameProps,
}) => (
  <>
    <CreateGameModal
      isOpen={view === 'create'}
      onBackdropClick={onBackdropClick}
      onCancel={onCloseAll}
      onSubmit={createGameProps.onSubmit}
      gameName={createGameProps.gameName}
      onGameNameChange={createGameProps.onGameNameChange}
      onGameNameBlur={createGameProps.onGameNameBlur}
      gameNameTouched={createGameProps.gameNameTouched}
      isGameNameValid={createGameProps.isGameNameValid}
      isGameNameTooLong={createGameProps.isGameNameTooLong}
      maxGameNameLength={createGameProps.maxGameNameLength}
      onGameTypeChange={createGameProps.onGameTypeChange}
      onScoringModeChange={createGameProps.onScoringModeChange}
      players={createGameProps.players}
      minPlayers={createGameProps.minPlayers}
      maxPlayerNameLength={createGameProps.maxPlayerNameLength}
      draftPlayer={createGameProps.draftPlayer}
      draftTouched={createGameProps.draftTouched}
      draftErrors={createGameProps.draftErrors}
      arePlayersValid={createGameProps.arePlayersValid}
      onAddPlayer={createGameProps.onAddPlayer}
      onRemovePlayer={createGameProps.onRemovePlayer}
      onDraftNameChange={createGameProps.onDraftNameChange}
      onDraftBlur={createGameProps.onDraftBlur}
      onDraftAvatarSelect={createGameProps.onDraftAvatarSelect}
      onDraftAvatarCycle={createGameProps.onDraftAvatarCycle}
      createError={createGameProps.createError}
      isCreating={createGameProps.isCreating}
    />
    <ResumeGameModal
      isOpen={view === 'session'}
      game={activeGame}
      mode={activeGameMode}
      onBackdropClick={onBackdropClick}
      onClose={onCloseAll}
    />
    <DeleteGameModal
      isOpen={Boolean(pendingDelete)}
      game={pendingDelete}
      onBackdropClick={onBackdropClick}
      onCancel={onDeleteCancel}
      onConfirm={onDeleteConfirm}
    />
  </>
)

export default ModalManager
