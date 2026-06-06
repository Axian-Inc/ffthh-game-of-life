import CreateGameModal from './CreateGameModal'
import ResumeGameModal from './ResumeGameModal'
import DeleteGameModal from './DeleteGameModal'
import PlayerHistoryModal from './PlayerHistoryModal'
import ActionSelectionModal from './ActionSelectionModal'

const ModalManager = ({
  view,
  activeGame,
  activeGameMode,
  pendingDelete,
  actionSelection,
  historyPlayer,
  historyEntries,
  onBackdropClick,
  onCloseAll,
  onActionSelectionCancel,
  onActionSelectionConfirm,
  onHistoryClose,
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
      onStatusChange={createGameProps.onStatusChange}
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
    {actionSelection ? (
      <ActionSelectionModal
        isOpen
        playerName={actionSelection.playerName || 'Player'}
        turnNumber={actionSelection.turnNumber || 1}
        onBackdropClick={onBackdropClick}
        onCancel={onActionSelectionCancel}
        onConfirm={onActionSelectionConfirm}
      />
    ) : null}
    <PlayerHistoryModal
      isOpen={Boolean(historyPlayer)}
      playerName={historyPlayer?.playerName || 'Player'}
      entries={historyEntries}
      onBackdropClick={onBackdropClick}
      onClose={onHistoryClose}
    />
  </>
)

export default ModalManager
