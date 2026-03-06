export const createDefaultPlayers = () => []

export const createDefaultDraftPlayer = () => ({
  name: '',
  avatar: 'monkey-face',
  cityId: '',
  educationTrackId: '',
  jobId: '',
})

export const buildNameCounts = (players) => {
  const counts = {}

  players.forEach((player) => {
    const name = player?.name?.trim().toLowerCase()
    if (!name) {
      return
    }
    counts[name] = (counts[name] || 0) + 1
  })

  return counts
}

export const getPlayerErrors = ({ player, nameCounts, maxPlayerNameLength }) => {
  const errors = { name: '' }
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

export const getGameNameError = ({ isValid, isTooLong, maxLength }) => {
  if (isValid) {
    return ''
  }
  if (isTooLong) {
    return `Name must be ${maxLength} characters or fewer.`
  }
  return 'Game name is required.'
}
