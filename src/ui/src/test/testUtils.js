export const createPlayer = (overrides = {}) => ({
  id: overrides.id ?? 'player-1',
  name: overrides.name ?? 'Ari',
  avatar: overrides.avatar ?? 'fox',
  cityId: overrides.cityId ?? 'suburbia',
  educationTrackId: overrides.educationTrackId ?? 'self-taught',
  jobId: overrides.jobId ?? 'content-creator',
  careerTrack: overrides.careerTrack ?? null,
  ...overrides,
})

export const createGame = (overrides = {}) => ({
  id: overrides.id ?? 'game-1',
  name: overrides.name ?? 'Family Game Night',
  status: overrides.status ?? 'active',
  players: overrides.players ?? [createPlayer()],
  turnNumber: overrides.turnNumber ?? 1,
  activePlayerIndex: overrides.activePlayerIndex ?? 0,
  lastUpdated: overrides.lastUpdated ?? Date.now(),
  createdAt: overrides.createdAt ?? Date.now(),
  resumable: overrides.resumable ?? true,
  ...overrides,
})
