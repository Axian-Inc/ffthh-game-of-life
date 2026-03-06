export const createCommittedPlayer = (overrides = {}) => ({
  id: overrides.id ?? '',
  name: overrides.name ?? '',
  avatar: overrides.avatar ?? '',
  cityId: overrides.cityId ?? '',
  educationTrackId: overrides.educationTrackId ?? '',
  jobId: overrides.jobId ?? '',
  careerTrack: overrides.careerTrack ?? '',
  ...overrides,
})

export const createDraftPlayer = (overrides = {}) => ({
  name: overrides.name ?? '',
  avatar: overrides.avatar ?? '',
  cityId: overrides.cityId ?? '',
  educationTrackId: overrides.educationTrackId ?? '',
  jobId: overrides.jobId ?? '',
  ...overrides,
})

export const createDefaultPlayers = () => []

export const createSetupDraft = (overrides = {}) => ({
  name: overrides.name ?? '',
  players: Array.isArray(overrides.players) ? overrides.players.map((player) => createCommittedPlayer(player)) : [],
  draftPlayer: createDraftPlayer(overrides.draftPlayer),
  currentStep: overrides.currentStep ?? 1,
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
