const StatusPill = ({ status }) => (
  <span className={`status-pill status-${status}`}>{String(status || '').toUpperCase()}</span>
)

export default StatusPill
