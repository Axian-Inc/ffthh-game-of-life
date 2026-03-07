const StatusPill = ({ status }) => (
  <span className={`status-pill status-${status}`}>{status.toUpperCase()}</span>
)

export default StatusPill
