export const formatRelativeTime = (updatedAt: number, now = Date.now()): string => {
  const diffMs = Math.max(0, now - updatedAt)
  const diffMinutes = Math.floor(diffMs / (60 * 1000))

  if (diffMinutes < 60) {
    const minutes = Math.max(1, diffMinutes)
    const label = minutes === 1 ? 'minute' : 'minutes'
    return `about ${minutes} ${label} ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    const label = diffHours === 1 ? 'hour' : 'hours'
    return `about ${diffHours} ${label} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  const label = diffDays === 1 ? 'day' : 'days'
  return `about ${diffDays} ${label} ago`
}
