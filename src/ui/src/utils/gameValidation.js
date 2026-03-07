export const createDefaultPlayers = () => []

export const buildNameCounts = (players) => {
  const counts = {}

  players.forEach((player) => {
    const name = player.name.trim().toLowerCase()
    if (!name) {
      return
    }
    counts[name] = (counts[name] || 0) + 1
  })

  return counts
}

export const getPlayerErrors = ({ player, nameCounts, maxPlayerNameLength }) => {
  const errors = { name: '', cityId: '', educationTrackId: '', jobId: '' }
  const trimmedName = player.name.trim()
  if (!trimmedName) {
    errors.name = 'Nickname is required.'
  }
  if (trimmedName.length > maxPlayerNameLength) {
    errors.name = `Name must be ${maxPlayerNameLength} characters or fewer.`
  }
  if (nameCounts[trimmedName.toLowerCase()] > 1) {
    errors.name = 'Names must be unique.'
  }
  return errors
}

export const isConfiguredPlayerValid = (player, { maxPlayerNameLength = 24 } = {}) => {
  if (!player) {
    return false
  }

  const trimmedName = player.name?.trim() || ''
  return Boolean(
    trimmedName &&
      trimmedName.length <= maxPlayerNameLength &&
      player.avatar &&
      player.cityId &&
      player.educationTrackId &&
      player.jobId &&
      player.careerTrack,
  )
}

export const getGameNameError = ({ isValid, isTooLong, maxLength }) => {
  if (isValid) {
    return ''
  }
  if (isTooLong) {
    return `Name must be ${maxLength} characters or fewer.`
  }
  return 'Game name is required.'
}
