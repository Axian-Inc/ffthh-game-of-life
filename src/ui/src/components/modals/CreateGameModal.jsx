import { X } from 'lucide-react'
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
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <div className="modal wizard-modal" aria-labelledby="new-game-wizard-title">
        <button className="modal-close" type="button" onClick={onCancel} aria-label="Close modal">
          <X aria-hidden="true" />
        </button>
        <div className="modal-body wizard-modal-body">
          <NewGameWizard
            gameName={gameName}
            onGameNameChange={onGameNameChange}
            onSubmit={onSubmit}
            onAddPlayer={onAddPlayer}
            onDraftNameChange={onDraftNameChange}
            players={players}
            draftPlayer={draftPlayer}
            isCreating={isCreating}
          />
          {createError ? (
            <p className="wizard-error" role="alert">
              {createError}
            </p>
          ) : null}
        </div>
      </div>
    </ModalBackdrop>
  )
}

export default CreateGameModal
