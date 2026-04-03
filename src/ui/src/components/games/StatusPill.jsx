const STATUS_LABELS = {
  turn_ready: 'READY',
  handoff: 'HANDOFF',
  completed: 'COMPLETED',
  active: 'ACTIVE',
  paused: 'PAUSED',
}

const StatusPill = ({ status }) => (
  <span className={`status-pill status-${status}`}>{STATUS_LABELS[status] || String(status || '').toUpperCase()}</span>
)

export default StatusPill
