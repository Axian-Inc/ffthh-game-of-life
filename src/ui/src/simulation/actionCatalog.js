import { normalizePlayerState } from './playerState'
import { createSeededRng } from './random'

const ACTION_LIBRARY = {
  workout: {
    id: 'workout',
    label: 'Workout',
    apCost: 1,
    roleTag: 'Repair',
    riskTag: 'Low Risk',
    promise: 'Improve your health and lower stress.',
    previewText: 'Likely health gain, small cash cost, low chance of overdoing it.',
    futureHint: 'You might be sore next month if you push too hard.',
  },
  social_time: {
    id: 'social_time',
    label: 'Social Time',
    apCost: 1,
    roleTag: 'Safe',
    riskTag: 'Low Risk',
    promise: 'Protect your mood and lower pressure.',
    previewText: 'Likely mental-health gain with a modest spending hit.',
    futureHint: 'A strong support network can soften future bad months.',
  },
  debt_paydown: {
    id: 'debt_paydown',
    label: 'Debt Paydown',
    apCost: 1,
    roleTag: 'Repair',
    riskTag: 'Low Risk',
    promise: 'Reduce debt pressure and future drag.',
    previewText: 'Likely lower debt and stress, but less cash right now.',
    futureHint: 'Lower debt can make next month feel lighter.',
  },
  study: {
    id: 'study',
    label: 'Study',
    apCost: 2,
    roleTag: 'Growth',
    riskTag: 'Medium Risk',
    promise: 'Trade short-term comfort for future career upside.',
    previewText: 'Likely cash loss and stress, with a chance of later momentum.',
    futureHint: 'This might open a door next month.',
  },
  side_gig: {
    id: 'side_gig',
    label: 'Side Gig',
    apCost: 2,
    roleTag: 'Growth',
    riskTag: 'Medium Risk',
    promise: 'Bring in money fast, but stretch yourself thinner.',
    previewText: 'Likely cash gain with stress and health pressure.',
    futureHint: 'If you overextend, it could catch up with you later.',
  },
  vacation_escape: {
    id: 'vacation_escape',
    label: 'Vacation Escape',
    apCost: 2,
    roleTag: 'Safe',
    riskTag: 'Medium Risk',
    promise: 'Spend to reset your head and body.',
    previewText: 'Likely mental-health relief with real money downside.',
    futureHint: 'The breathing room may pay off next month.',
  },
  startup_bet: {
    id: 'startup_bet',
    label: 'Startup Bet',
    apCost: 3,
    roleTag: 'Chaos',
    riskTag: 'High Risk',
    promise: 'Take a big swing on a volatile opportunity.',
    previewText: 'High upside, painful downside, and possible delayed consequences.',
    futureHint: 'This could boom or blow up later.',
  },
  festival_weekend: {
    id: 'festival_weekend',
    label: 'Festival Weekend',
    apCost: 2,
    roleTag: 'Chaos',
    riskTag: 'Medium Risk',
    promise: 'Blow off steam and chase a memorable month.',
    previewText: 'Likely stress relief, money loss, and a small chance of a rough comedown.',
    futureHint: 'Fun now can still leave a mess for later.',
  },
}

export const getActionDefinition = (actionId) => ACTION_LIBRARY[actionId] || null

export const getActionLabel = (actionId) => ACTION_LIBRARY[actionId]?.label || 'End Turn'

export const computeActionPoints = (player) => {
  let points = 3

  if (player.stress >= 70) {
    points -= 1
  }

  if (player.physicalHealth <= 35 || player.mentalHealth <= 35) {
    points -= 1
  }

  if (player.stress <= 30 && player.physicalHealth >= 65 && player.mentalHealth >= 65 && (player.activeIssues || []).length === 0) {
    points += 1
  }

  return Math.max(1, Math.min(4, points))
}

const toIssueAction = (issue) => ({
  id: `address_issue:${issue.id}`,
  label: `Address ${issue.label}`,
  apCost: 2,
  roleTag: 'Repair',
  riskTag: 'Urgent',
  promise: 'Deal with this before it snowballs.',
  previewText: `Ignoring it already has ${issue.stackCount || 0} stack${issue.stackCount === 1 ? '' : 's'} of pressure.`,
  futureHint: 'Leaving it alone will usually make next month worse.',
})

const scoreAction = (actionId, player, turnNumber, rng) => {
  const monthPulse = turnNumber % 4
  const randomNudge = rng()

  switch (actionId) {
    case 'workout':
      return (
        1 +
        (player.physicalHealth <= 68 ? 2.3 : 0.3) +
        (player.stress >= 40 ? 1.1 : 0) +
        (monthPulse === 1 ? 0.35 : 0) +
        randomNudge
      )
    case 'social_time':
      return (
        1 +
        (player.mentalHealth <= 67 ? 1.9 : 0.4) +
        (player.stress >= 45 ? 1.3 : 0) +
        (monthPulse === 2 ? 0.35 : 0) +
        randomNudge
      )
    case 'debt_paydown':
      return (
        1 +
        (player.debt > player.monthlyIncome ? 2.4 : 0.4) +
        (player.cash >= 1200 ? 0.8 : -0.6) +
        (monthPulse === 0 ? 0.35 : 0) +
        randomNudge
      )
    case 'study':
      return (
        1 +
        (player.cash >= 1800 ? 1.2 : -0.8) +
        (player.stress <= 55 ? 0.6 : -0.4) +
        (monthPulse === 3 ? 0.4 : 0) +
        randomNudge
      )
    case 'side_gig':
      return (
        1 +
        (player.cash < 2200 ? 1.8 : 0.2) +
        (player.stress < 60 ? 0.7 : -0.7) +
        (monthPulse === 1 ? 0.25 : 0) +
        randomNudge
      )
    case 'vacation_escape':
      return (
        0.6 +
        (player.cash >= 3200 ? 1.3 : -0.8) +
        (player.stress >= 48 || player.mentalHealth <= 64 ? 1.5 : 0) +
        (monthPulse === 2 ? 0.45 : 0) +
        randomNudge
      )
    case 'startup_bet':
      return (
        0.4 +
        (player.cash >= 2600 || player.assetsValue >= 2800 ? 1.8 : -1.1) +
        (player.stress <= 58 ? 0.4 : -0.4) +
        (monthPulse === 0 ? 0.55 : 0) +
        randomNudge
      )
    case 'festival_weekend':
      return (
        0.5 +
        (player.stress >= 42 || player.mentalHealth <= 66 ? 1.4 : 0.1) +
        (player.cash >= 1500 ? 0.5 : -0.5) +
        (monthPulse === 3 ? 0.45 : 0) +
        randomNudge
      )
    default:
      return randomNudge
  }
}

const buildContextualOfferSet = (normalizedPlayer, turnNumber, rng) => {
  const ranked = Object.keys(ACTION_LIBRARY)
    .map((actionId) => ({
      actionId,
      score: scoreAction(actionId, normalizedPlayer, turnNumber, rng),
      roleTag: ACTION_LIBRARY[actionId].roleTag,
    }))
    .sort((left, right) => right.score - left.score)

  const selected = []
  const selectedRoles = new Set()

  for (const candidate of ranked) {
    if (selected.length >= 4) {
      break
    }
    if (!selectedRoles.has(candidate.roleTag)) {
      selected.push(candidate.actionId)
      selectedRoles.add(candidate.roleTag)
    }
  }

  for (const candidate of ranked) {
    if (selected.length >= 4) {
      break
    }
    if (!selected.includes(candidate.actionId)) {
      selected.push(candidate.actionId)
    }
  }

  return selected
}

export const getAvailableTurnActions = ({ game, player, turnNumber }) => {
  const normalizedPlayer = normalizePlayerState(player, game?.modifierContext)
  const actionPoints = computeActionPoints(normalizedPlayer)
  const issueActions = (normalizedPlayer.activeIssues || []).map(toIssueAction)
  const rng = createSeededRng(`${game?.seed || game?.id || 'game'}:offer:${turnNumber}:${normalizedPlayer.id}`)

  const curatedActions = buildContextualOfferSet(normalizedPlayer, turnNumber, rng).map((actionId) => ACTION_LIBRARY[actionId])

  return {
    actionPoints,
    curatedActions,
    issueActions,
    advancedActions: [],
    unexpectedActions: issueActions,
    explanation:
      normalizedPlayer.stress >= 55 || normalizedPlayer.debt > normalizedPlayer.monthlyIncome
        ? 'This month is shaping around your pressure points.'
        : 'You have a few strong options this month. Choose how hard to push.',
  }
}
