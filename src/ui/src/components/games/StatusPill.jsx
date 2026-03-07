const StatusPill = ({ status }) => {
  const normalizedStatus = `${status || ''}`.toLowerCase()
  return <span className={`status-pill status-${normalizedStatus}`}>{normalizedStatus.toUpperCase()}</span>
}

export default StatusPill
