export const createPlayer = (overrides = {}) => ({
  id: overrides.id ?? 'player-1',
  name: overrides.name ?? 'Ari',
  avatar: overrides.avatar ?? 'fox',
  cityId: overrides.cityId ?? 'suburbia',
  educationTrackId: overrides.educationTrackId ?? 'self-taught',
  jobId: overrides.jobId ?? 'content-creator',
  careerId: overrides.careerId ?? 'street-smart',
  cash: overrides.cash ?? 1800,
  debts: overrides.debts ?? [],
  assets: overrides.assets ?? [],
  netWorth: overrides.netWorth ?? 1800,
  physicalHealth: overrides.physicalHealth ?? 100,
  mentalHealth: overrides.mentalHealth ?? 100,
  statusEffects: overrides.statusEffects ?? [],
  actionHistory: overrides.actionHistory ?? [],
  ...overrides,
})

export const createGame = (overrides = {}) => {
  const players = overrides.players ?? [createPlayer()]
  const activePlayerIndex = overrides.activePlayerIndex ?? 0
  const now = overrides.lastUpdated ?? Date.now()

  return {
    id: overrides.id ?? 'game-1',
    name: overrides.name ?? 'Family Game Night',
    status: overrides.status ?? 'turn_ready',
    players,
    lastUpdated: now,
    createdAt: overrides.createdAt ?? now,
    randomSeed: overrides.randomSeed ?? 'seed-1',
    version: overrides.version ?? 1,
    currentMonth: overrides.currentMonth ?? 1,
    activePlayerIndex,
    availableActions: overrides.availableActions ?? [],
    lastTurnResolution: overrides.lastTurnResolution ?? null,
    pendingHandoff:
      overrides.pendingHandoff ??
      (overrides.status === 'handoff'
        ? {
            fromPlayerId: players[0]?.id ?? 'player-1',
            toPlayerId: players[activePlayerIndex]?.id ?? 'player-1',
            toPlayerName: players[activePlayerIndex]?.name ?? 'Ari',
            month: overrides.currentMonth ?? 1,
            readyAt: now,
          }
        : null),
    ...overrides,
  }
}
