const absoluteValue = (value) => Math.abs(Number(value) || 0)

const deltaCardsPriority = [
  { key: 'netWorth', label: 'Net Worth', type: 'currency' },
  { key: 'cash', label: 'Cash', type: 'currency' },
  { key: 'debt', label: 'Debt', type: 'currency' },
  { key: 'stress', label: 'Stress', type: 'number' },
  { key: 'mentalHealth', label: 'Mental Health', type: 'number' },
  { key: 'physicalHealth', label: 'Physical Health', type: 'number' },
]

const getPrimaryDeltaHeadline = (totalDelta = {}) => {
  const ranked = [
    { key: 'netWorth', label: 'money', value: totalDelta.netWorth || 0 },
    { key: 'stress', label: 'stress', value: totalDelta.stress || 0 },
    { key: 'mentalHealth', label: 'mental health', value: totalDelta.mentalHealth || 0 },
    { key: 'physicalHealth', label: 'physical health', value: totalDelta.physicalHealth || 0 },
  ].sort((left, right) => absoluteValue(right.value) - absoluteValue(left.value))

  const top = ranked[0]
  if (!top || absoluteValue(top.value) === 0) {
    return 'A quieter month gives you room to choose your next move.'
  }

  if (top.key === 'stress' && top.value > 0) {
    return 'The month left you feeling more stretched than before.'
  }
  if (top.key === 'netWorth' && top.value > 0) {
    return 'Your finances moved in the right direction last month.'
  }
  if (top.key === 'netWorth' && top.value < 0) {
    return 'Money slipped backwards last month and now needs attention.'
  }
  if (top.key === 'mentalHealth' && top.value < 0) {
    return 'Your mood took a hit and it is shaping this month.'
  }
  if (top.key === 'physicalHealth' && top.value < 0) {
    return 'Your body is asking for a slower, smarter month.'
  }

  return 'Last month changed your footing. Decide how to answer it.'
}

export const getLatestPlayerHistoryEntry = (game, playerId) => {
  const entries = Array.isArray(game?.moveHistory) ? game.moveHistory : []
  return entries
    .filter((entry) => String(entry.playerId) === String(playerId))
    .sort((left, right) => (right.createdAt || 0) - (left.createdAt || 0))[0] || null
}

export const buildTurnBrief = ({ game, player, turnNumber }) => {
  const lastEntry = getLatestPlayerHistoryEntry(game, player?.id)
  const lastTurnLog = lastEntry?.turnLog || null
  const revealedConsequences = (player?.pendingConsequences || []).filter(
    (consequence) => Number(consequence?.revealOnTurnNumber) <= Number(turnNumber),
  )
  const activeIssues = Array.isArray(player?.activeIssues) ? player.activeIssues : []
  const progressionArcs = Array.isArray(player?.progressionArcs) ? player.progressionArcs.filter((arc) => arc.value > 0) : []
  const monthHeadline =
    revealedConsequences[0]?.headline || lastTurnLog?.monthHeadline || getPrimaryDeltaHeadline(lastEntry?.statDelta)

  return {
    monthHeadline,
    previousTurnSummary: lastEntry
      ? {
          actionLabel: lastEntry.actionLabel,
          turnNumber: lastEntry.turnNumber,
          statDelta: lastEntry.statDelta || {},
          topCallouts: lastTurnLog?.topCallouts || [],
          queuedConsequencesPreview: lastTurnLog?.queuedConsequencesPreview || [],
        }
      : null,
    revealedConsequences,
    activeIssues,
    progressionArcs: progressionArcs.slice(0, 3),
  }
}

export const buildTurnReveal = ({ game, player, turnNumber }) => {
  const brief = buildTurnBrief({ game, player, turnNumber })
  const statDelta = brief.previousTurnSummary?.statDelta || {}
  const topDeltaCards = deltaCardsPriority
    .map((entry) => ({
      ...entry,
      value: Number(statDelta?.[entry.key]) || 0,
    }))
    .filter((entry) => entry.value !== 0)
    .sort((left, right) => absoluteValue(right.value) - absoluteValue(left.value))
    .slice(0, 3)

  return {
    turnNumber,
    playerName: player?.name?.trim() || 'Player',
    monthHeadline: brief.monthHeadline,
    topDeltaCards,
    callouts: (brief.previousTurnSummary?.topCallouts || []).slice(0, 2),
    revealedConsequences: (brief.revealedConsequences || []).slice(0, 2),
  }
}
