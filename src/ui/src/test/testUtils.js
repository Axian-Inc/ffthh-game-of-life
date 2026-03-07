export const createPlayer = (overrides = {}) => ({
  id: overrides.id ?? 'player-1',
  name: overrides.name ?? 'Ari',
  avatar: overrides.avatar ?? 'monkey-face',
  cityId: overrides.cityId ?? 'city-1',
  educationTrackId: overrides.educationTrackId ?? 'degree-track',
  jobId: overrides.jobId ?? 'job-1',
  careerTrack: overrides.careerTrack ?? '',
  ...overrides,
})

export const createGame = (overrides = {}) => ({
  id: overrides.id ?? 'game-1',
  name: overrides.name ?? 'Family Game Night',
  status: overrides.status ?? 'active',
  players: overrides.players ?? [createPlayer()],
  lastUpdated: overrides.lastUpdated ?? Date.now(),
  createdAt: overrides.createdAt ?? Date.now(),
  resumable: overrides.resumable ?? true,
  ...overrides,
})
