const StatusPill = ({ status }) => (
  <span className={`status-pill status-${status}`} aria-label={`Status: ${status}`}>
    {status.toUpperCase()}
  </span>
)

export default StatusPill
