import { useState } from 'react'
import { ACTION_DEFINITIONS } from '../../data/actionDefinitions'
import ModalBackdrop from './ModalBackdrop'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const ActionSelectionModal = ({
  isOpen,
  playerName = 'Player',
  turnNumber = 1,
  onBackdropClick,
  onCancel,
  onConfirm,
}) => {
  const [selectedActionId, setSelectedActionId] = useState('')

  if (!isOpen) {
    return null
  }

  const selectedAction = ACTION_DEFINITIONS.find((action) => action.id === selectedActionId) || null

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <div className="modal action-selection-modal">
        <div className="modal-body">
          <p className="eyebrow">Choose Action</p>
          <h2 className="modal-title-dark">{`${playerName}'s Turn ${turnNumber}`}</h2>
          <p className="tagline">
            Pick one action to record for this month. Effects and outcome resolution will be added in a later slice.
          </p>

          <div className="action-selection-grid" aria-label="Available actions">
            {ACTION_DEFINITIONS.map((action) => (
              <button
                aria-pressed={selectedActionId === action.id}
                className={`action-selection-card ${selectedActionId === action.id ? 'is-selected' : ''}`.trim()}
                key={action.id}
                onClick={() => setSelectedActionId(action.id)}
                type="button"
              >
                <span className="action-selection-category">{action.category}</span>
                <span className="action-selection-label">{action.label}</span>
                <span className="action-selection-description">{action.description}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <div className="modal-actions">
            <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
            <PrimaryButton disabled={!selectedAction} onClick={() => selectedAction && onConfirm(selectedAction)}>
              Choose Action
            </PrimaryButton>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  )
}

export default ActionSelectionModal
