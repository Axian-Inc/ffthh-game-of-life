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
      onCancel={onCloseAll}
      onSubmit={createGameProps.onSubmit}
      submitError={createGameProps.submitError}
      isSubmitting={createGameProps.isSubmitting}
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
