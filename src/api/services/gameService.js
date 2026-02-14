const { randomUUID } = require('crypto')
const {
  validateCreatePayload,
  validateUpdatePayload,
  isPlainObject,
  validateCareerSelections,
} = require('./gameValidation')

const createServiceError = (type, message, details) => {
  const error = new Error(message)
  error.type = type
  if (details) {
    error.details = details
  }
  return error
}

const sanitizeMetadata = (metadata = {}) => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {}
  }
  const { private: _private, sensitive: _sensitive, secrets: _secrets, ...rest } = metadata
  return rest
}

const toPublicGame = (record) => {
  if (!record) {
    return null
  }
  const { userId: _userId, metadata, ...rest } = record
  return {
    ...rest,
    metadata: sanitizeMetadata(metadata),
  }
}

const createGame = async ({ payload, userId, repo, now = Date.now, uuid = randomUUID }) => {
  const errors = validateCreatePayload(payload)
  if (errors.length) {
    throw createServiceError('validation', 'Validation failed.', errors)
  }

  const timestamp = now()
  const gameBase = {
    name: payload.name.trim(),
    status: 'new',
    createdAt: timestamp,
    updatedAt: timestamp,
    players: payload.players.map((player) => ({
      ...player,
      name: player.name.trim(),
    })),
    currentTurnState: isPlainObject(payload.currentTurnState) ? payload.currentTurnState : {},
    metadata: isPlainObject(payload.metadata) ? payload.metadata : {},
    version: 1,
  }

  let attempts = 0
  while (attempts < 3) {
    const gameId = uuid()
    const record = await repo.createGame(userId, { ...gameBase, id: gameId })
    if (record) {
      return toPublicGame(record)
    }
    attempts += 1
  }

  throw createServiceError('server', 'Unable to save game.')
}

const updateGame = async ({ gameId, payload, userId, repo, now = Date.now }) => {
  const errors = validateUpdatePayload(payload)
  if (errors.length) {
    throw createServiceError('validation', 'Validation failed.', errors)
  }

  if (payload.id !== gameId) {
    throw createServiceError('validation', 'Game id must match URL.', [{ field: 'id', message: 'Game id must match URL.' }])
  }

  const existing = await repo.getGameById(gameId)
  if (!existing) {
    throw createServiceError('notFound', 'Game not found.')
  }
  if (existing.userId !== userId) {
    throw createServiceError('forbidden', 'User is not authorized to update this game.')
  }
  if (existing.version !== payload.version) {
    throw createServiceError('conflict', 'Version conflict.')
  }

  if (payload.status === 'active') {
    const selectionErrors = validateCareerSelections(payload)
    if (selectionErrors.length) {
      throw createServiceError('validation', 'Validation failed.', selectionErrors)
    }
  }

  const updatedAt = now()
  const nextVersion = payload.version + 1
  const record = await repo.updateGame(userId, {
    ...payload,
    updatedAt,
    version: nextVersion,
  }, payload.version)

  if (!record) {
    throw createServiceError('conflict', 'Version conflict.')
  }

  return toPublicGame(record)
}

const deleteGame = async ({ gameId, userId, repo }) => {
  const existing = await repo.getGameById(gameId)
  if (!existing) {
    throw createServiceError('notFound', 'Game not found.')
  }
  if (existing.userId !== userId) {
    throw createServiceError('forbidden', 'User is not authorized to delete this game.')
  }

  const deleted = await repo.deleteGame(userId, gameId)
  if (!deleted) {
    throw createServiceError('notFound', 'Game not found.')
  }
}

const getGameById = async ({ gameId, repo }) => {
  const record = await repo.getGameById(gameId)
  if (!record) {
    throw createServiceError('notFound', 'Game not found.')
  }
  return toPublicGame(record)
}

const listGamesByUser = async ({ userId, repo }) => {
  const records = await repo.listGamesByUser(userId)
  return records.map(toPublicGame)
}

module.exports = {
  createGame,
  updateGame,
  deleteGame,
  getGameById,
  listGamesByUser,
}
