import ModalBackdrop from './ModalBackdrop'
import PrimaryButton from '../ui/PrimaryButton'

const METRIC_LABELS = {
  cash: 'Cash',
  physicalHealth: 'Physical health',
  mentalHealth: 'Mental health',
}

const formatAmount = (effect) => {
  const amount = effect?.amount || 0
  const sign = amount > 0 ? '+' : ''
  return effect?.metric === 'cash' ? `${sign}$${amount.toLocaleString()}` : `${sign}${amount}`
}

const formatResult = (metric, value) => {
  if (!Number.isFinite(value)) {
    return 'Unavailable'
  }
  return metric === 'cash' ? `$${value.toLocaleString()}` : `${value} / 100`
}

const PlayerEventModal = ({ event, resultingValue, onContinue }) => {
  if (!event) {
    return null
  }

  const metricLabel = METRIC_LABELS[event.effect?.metric] || 'Status'
  const outcome = event.outcome || 'neutral'
  const isFallback = event.generationMode === 'fallback'
  const announcement = `${outcome} outcome. ${metricLabel} changed by ${formatAmount(event.effect)}.`

  return (
    <ModalBackdrop ariaLabelledBy="player-event-title">
      <article className="modal player-event-modal">
        <div className="modal-body player-event-body">
          <p className="eyebrow">Your Life Event</p>
          <h2 className="modal-title-dark" id="player-event-title">{event.title}</h2>
          <p className="player-event-narrative">{event.narrative}</p>

          <div className="player-event-outcome" role="status" aria-live="assertive" aria-atomic="true">
            <span className={`player-event-badge is-${outcome}`}>{outcome}</span>
            <p className="player-event-announcement">{announcement}</p>
            <dl className="player-event-effect" aria-label="Event effect">
              <div>
                <dt>Change</dt>
                <dd>{`${metricLabel} ${formatAmount(event.effect)}`}</dd>
              </div>
              <div>
                <dt>New value</dt>
                <dd>{formatResult(event.effect?.metric, resultingValue)}</dd>
              </div>
            </dl>
          </div>

          <div className="player-event-source">
            <p className="player-event-source-label">
              {isFallback ? 'Source checked' : 'Inspired by'}: {event.source?.publisher || 'Modern Game of Life'}
            </p>
            <p className="player-event-headline">{event.source?.headline || 'Family-safe life event'}</p>
            {isFallback ? (
              <p className="player-event-source-note">
                A reviewed backup event was used because a live source-based event could not be generated.
              </p>
            ) : null}
          </div>
        </div>
        <div className="modal-footer player-event-footer">
          <PrimaryButton data-autofocus="true" onClick={onContinue}>Continue</PrimaryButton>
        </div>
      </article>
    </ModalBackdrop>
  )
}

export default PlayerEventModal
