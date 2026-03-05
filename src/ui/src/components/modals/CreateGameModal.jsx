import { Gamepad2, X } from 'lucide-react'
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
  draftErrors,
  maxPlayerNameLength,
  onAddPlayer,
  onDraftNameChange,
  onDraftAvatarCycle,
  createError,
  isCreating,
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon" aria-hidden="true">
              <Gamepad2 aria-hidden="true" />
            </div>
            <div>
              <h2 className="modal-title">New Game</h2>
              <p className="modal-subtitle">Build your players one step at a time.</p>
            </div>
          </div>
          <button className="modal-close" type="button" onClick={onCancel} aria-label="Close modal">
            <X aria-hidden="true" />
          </button>
        </div>
        <NewGameWizard
          gameName={gameName}
          onGameNameChange={onGameNameChange}
          players={players}
          draftPlayer={draftPlayer}
          draftErrors={draftErrors}
          maxPlayerNameLength={maxPlayerNameLength}
          onAddPlayer={onAddPlayer}
          onDraftNameChange={onDraftNameChange}
          onDraftAvatarCycle={onDraftAvatarCycle}
          onCancel={onCancel}
          onSubmit={onSubmit}
          createError={createError}
          isCreating={isCreating}
        />
      </div>
    </ModalBackdrop>
  )
}

export default CreateGameModal
