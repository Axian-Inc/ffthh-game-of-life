import CreateGameModal from './CreateGameModal'
import ResumeGameModal from './ResumeGameModal'
import DeleteGameModal from './DeleteGameModal'
import PlayerHistoryModal from './PlayerHistoryModal'
import PlayerEventModal from './PlayerEventModal'

const ModalManager = ({
  view,
  activeGame,
  activeGameMode,
  pendingDelete,
  historyPlayer,
  historyEntries,
  pendingTurnEvent,
  onBackdropClick,
  onCloseAll,
  onHistoryClose,
  onEventContinue,
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
    <PlayerHistoryModal
      isOpen={Boolean(historyPlayer)}
      playerName={historyPlayer?.playerName || 'Player'}
      entries={historyEntries}
      onBackdropClick={onBackdropClick}
      onClose={onHistoryClose}
    />
    <PlayerEventModal
      event={pendingTurnEvent?.event}
      resultingValue={pendingTurnEvent?.resultingValue}
      onContinue={onEventContinue}
    />
  </>
)

export default ModalManager
