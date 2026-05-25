export const createDefaultPlayers = () => []

export const DEFAULT_CITY_ID = 'suburbia'
export const DEFAULT_EDUCATION_TRACK_ID = 'self-taught'
export const DEFAULT_JOB_ID = 'content-creator'

export const createDefaultDraftPlayer = (overrides = {}) => ({
  name: '',
  avatar: '',
  cityId: DEFAULT_CITY_ID,
  educationTrackId: DEFAULT_EDUCATION_TRACK_ID,
  jobId: DEFAULT_JOB_ID,
  ...overrides,
})

export const normalizeCommittedPlayer = (player) => ({
  id: String(player.id),
  name: (player.name || '').trim(),
  avatar: player.avatar || '',
  cityId: player.cityId || DEFAULT_CITY_ID,
  educationTrackId: player.educationTrackId || DEFAULT_EDUCATION_TRACK_ID,
  jobId: player.jobId || DEFAULT_JOB_ID,
  careerTrack: player.careerTrack || null,
})

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
  const errors = { name: '', avatar: '' }
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
  if (!player.avatar) {
    errors.avatar = 'Avatar is required.'
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
