import ModalBackdrop from './ModalBackdrop'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const noop = () => {}

const ActionPlannerModal = ({
  isOpen,
  isAdvancingTurn = false,
  selectedActionIds = [],
  curatedActions = [],
  issueActions = [],
  actionPoints = 0,
  remainingActionPoints = 0,
  onToggleAction = noop,
  onEndTurn = noop,
  onClose = noop,
}) => {
  if (!isOpen) {
    return null
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <ModalBackdrop onBackdropClick={handleBackdropClick}>
      <div className="modal play-turn-planner-modal">
        <div className="modal-body">
          <div className="play-turn-planner-header">
            <div>
              <p className="play-turn-brief-eyebrow">Action plan</p>
              <h2 className="modal-title-dark play-turn-planner-modal-title">Choose this month&apos;s moves</h2>
            </div>
            <div className="play-turn-planner-meta">
              <span>{`${selectedActionIds.length} selected`}</span>
              <strong>{`${remainingActionPoints} / ${actionPoints} AP left`}</strong>
            </div>
          </div>

          {issueActions.length ? (
            <div className="play-turn-planner-group">
              <p className="play-turn-planner-group-title">Urgent issues</p>
              <div className="play-turn-action-grid">
                {issueActions.map((action) => {
                  const selected = selectedActionIds.includes(action.id)
                  const disabled = (!selected && action.apCost > remainingActionPoints) || isAdvancingTurn
                  return (
                    <button
                      className={`play-turn-action-card is-issue ${selected ? 'is-selected' : ''}`.trim()}
                      disabled={disabled}
                      key={action.id}
                      onClick={() => onToggleAction(action.id)}
                      type="button"
                    >
                      <div className="play-turn-action-card-topline">
                        <strong>{action.label}</strong>
                        <span>{`${action.apCost} AP`}</span>
                      </div>
                      <p>{action.promise}</p>
                      <div className="play-turn-action-tags">
                        <span>{action.roleTag}</span>
                        <span>{action.riskTag}</span>
                      </div>
                      <small>{action.previewText}</small>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="play-turn-planner-group">
            <p className="play-turn-planner-group-title">Curated opportunities</p>
            <div className="play-turn-action-grid">
              {curatedActions.map((action) => {
                const selected = selectedActionIds.includes(action.id)
                const disabled = (!selected && action.apCost > remainingActionPoints) || isAdvancingTurn
                return (
                  <button
                    className={`play-turn-action-card ${selected ? 'is-selected' : ''}`.trim()}
                    disabled={disabled}
                    key={action.id}
                    onClick={() => onToggleAction(action.id)}
                    type="button"
                  >
                    <div className="play-turn-action-card-topline">
                      <strong>{action.label}</strong>
                      <span>{`${action.apCost} AP`}</span>
                    </div>
                    <p>{action.promise}</p>
                    <div className="play-turn-action-tags">
                      <span>{action.roleTag}</span>
                      <span>{action.riskTag}</span>
                    </div>
                    <small>{action.previewText}</small>
                    {action.futureHint ? <em>{action.futureHint}</em> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="modal-actions">
            <SecondaryButton className="play-turn-action-muted" data-autofocus="true" onClick={onClose}>
              Back to Brief
            </SecondaryButton>
            <PrimaryButton className="play-turn-action-primary" disabled={isAdvancingTurn} onClick={onEndTurn}>
              {isAdvancingTurn ? 'Ending Month...' : `End Turn${selectedActionIds.length ? ` (${selectedActionIds.length} actions)` : ''}`}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  )
}

export default ActionPlannerModal
