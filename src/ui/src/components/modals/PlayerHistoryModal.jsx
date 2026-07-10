import ModalBackdrop from './ModalBackdrop'
import SecondaryButton from '../ui/SecondaryButton'

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatTimestamp = (createdAt) => {
  if (!Number.isFinite(createdAt) || createdAt <= 0) {
    return 'Saved time unavailable'
  }
  return timestampFormatter.format(new Date(createdAt))
}

const formatSignedValue = (value, formatter = (innerValue) => innerValue) => {
  const safeValue = Number(value) || 0
  const prefix = safeValue > 0 ? '+' : ''
  return `${prefix}${formatter(safeValue)}`
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)

const PlayerHistoryModal = ({ isOpen, playerName, entries = [], onBackdropClick, onClose }) => {
  if (!isOpen) {
    return null
  }

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <div className="modal">
        <div className="modal-body">
          <p className="eyebrow">Player History</p>
          <h2 className="modal-title-dark">{`${playerName}'s Actions`}</h2>
          <p className="tagline">Review the saved moves recorded for this player so far.</p>

          {entries.length ? (
            <ol className="history-list" aria-label={`${playerName} move history`}>
              {entries.map((entry) => (
                <li className="history-item" key={entry.id}>
                  <div className="history-item-copy">
                    <p className="history-item-title">{entry.actionLabel}</p>
                    <p className="history-item-meta">{`Turn ${entry.turnNumber}`}</p>
                    {entry.actionsTaken?.length ? (
                      <p className="history-item-submeta">{entry.actionsTaken.map((action) => action.actionLabel).join(' + ')}</p>
                    ) : null}
                    {entry.turnLog?.topCallouts?.length ? (
                      <ul className="history-item-callouts">
                        {entry.turnLog.topCallouts.map((callout) => (
                          <li key={callout}>{callout}</li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="history-item-deltas">
                      <span>{`Net ${formatSignedValue(entry.statDelta?.netWorth || 0, formatCurrency)}`}</span>
                      <span>{`Stress ${formatSignedValue(entry.statDelta?.stress || 0)}`}</span>
                      <span>{`Mental ${formatSignedValue(entry.statDelta?.mentalHealth || 0)}`}</span>
                    </div>
                  </div>
                  <time className="history-item-time" dateTime={new Date(entry.createdAt || 0).toISOString()}>
                    {formatTimestamp(entry.createdAt)}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <div className="history-empty" aria-label="No player history">
              No moves have been recorded for this player yet.
            </div>
          )}
        </div>
        <div className="modal-footer">
          <div className="modal-actions">
            <SecondaryButton data-autofocus="true" onClick={onClose}>
              Close
            </SecondaryButton>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  )
}

export default PlayerHistoryModal
