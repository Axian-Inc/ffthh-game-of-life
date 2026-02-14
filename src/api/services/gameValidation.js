const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const validateCreatePayload = (payload) => {
  const errors = []
  if (!payload || typeof payload !== 'object') {
    errors.push({ field: 'payload', message: 'Game payload is required.' })
    return errors
  }

  if (!isNonEmptyString(payload.name)) {
    errors.push({ field: 'name', message: 'Game name is required.' })
  }

  if (!Array.isArray(payload.players)) {
    errors.push({ field: 'players', message: 'Player list is required.' })
  } else {
    if (payload.players.length < 1) {
      errors.push({ field: 'players', message: 'At least one player is required.' })
    }
    payload.players.forEach((player, index) => {
      if (!player || !isNonEmptyString(player.name)) {
        errors.push({ field: `players.${index}.name`, message: 'Player name is required.' })
      }
    })
  }

  return errors
}

const validateUpdatePayload = (payload) => {
  const errors = []
  if (!payload || typeof payload !== 'object') {
    errors.push({ field: 'payload', message: 'Game payload is required.' })
    return errors
  }

  if (!isNonEmptyString(payload.id)) {
    errors.push({ field: 'id', message: 'Game id is required.' })
  }
  if (!isNonEmptyString(payload.name)) {
    errors.push({ field: 'name', message: 'Game name is required.' })
  }
  if (!isNonEmptyString(payload.status)) {
    errors.push({ field: 'status', message: 'Game status is required.' })
  }
  if (!Number.isFinite(payload.createdAt)) {
    errors.push({ field: 'createdAt', message: 'Created timestamp is required.' })
  }
  if (!Array.isArray(payload.players)) {
    errors.push({ field: 'players', message: 'Player list is required.' })
  } else {
    if (payload.players.length < 1) {
      errors.push({ field: 'players', message: 'At least one player is required.' })
    }
    payload.players.forEach((player, index) => {
      if (!player || !isNonEmptyString(player.name)) {
        errors.push({ field: `players.${index}.name`, message: 'Player name is required.' })
      }
    })
  }
  if (!isPlainObject(payload.currentTurnState)) {
    errors.push({ field: 'currentTurnState', message: 'Current turn state is required.' })
  }
  if (!isPlainObject(payload.metadata)) {
    errors.push({ field: 'metadata', message: 'Metadata object is required.' })
  }
  if (!Number.isFinite(payload.version)) {
    errors.push({ field: 'version', message: 'Game version is required.' })
  }

  return errors
}

const validateCareerSelections = (payload) => {
  const errors = []
  if (!payload || typeof payload !== 'object') {
    errors.push({ field: 'currentTurnState', message: 'Career selections are required.' })
    return errors
  }

  const selections = payload.currentTurnState?.careerSelections
  if (!selections || typeof selections !== 'object' || Array.isArray(selections)) {
    errors.push({ field: 'currentTurnState.careerSelections', message: 'Career selections are required.' })
    return errors
  }

  const playerKeys = payload.players.map((player) => player.name)
  playerKeys.forEach((name) => {
    if (!selections[name]) {
      errors.push({ field: `careerSelections.${name}`, message: 'Career selection is required.' })
    }
  })

  const restricted = Array.isArray(payload.metadata?.restrictedRoles)
    ? payload.metadata.restrictedRoles
    : []
  if (restricted.length) {
    const used = {}
    playerKeys.forEach((name) => {
      const selection = selections[name]
      if (!selection || !restricted.includes(selection)) {
        return
      }
      used[selection] = (used[selection] || 0) + 1
    })
    Object.entries(used).forEach(([role, count]) => {
      if (count > 1) {
        errors.push({ field: `careerSelections.${role}`, message: 'Restricted roles must be unique.' })
      }
    })
  }

  return errors
}

module.exports = {
  isNonEmptyString,
  isPlainObject,
  validateCreatePayload,
  validateUpdatePayload,
  validateCareerSelections,
}
