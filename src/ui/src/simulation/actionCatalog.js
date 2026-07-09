import { createSeededRng } from './random'
import { normalizePlayerState } from './playerState'
import { getActionPotentialEffects } from './turnResolver'

export const REGULAR_ACTIONS = [
  { id: 'study', label: 'Study', description: 'Invest in skills, near-term cost for growth.', category: 'regular' },
  { id: 'workout', label: 'Workout', description: 'Improve health and reduce stress.', category: 'regular' },
  { id: 'side_gig', label: 'Side Gig', description: 'Boost cash now with higher stress.', category: 'regular' },
  { id: 'debt_paydown', label: 'Debt Paydown', description: 'Lower debt pressure and interest drag.', category: 'regular' },
  { id: 'social_time', label: 'Social Time', description: 'Support mental health and resilience.', category: 'regular' },
]

const ADVANCED_ACTIONS = [
  {
    id: 'vacation_escape',
    label: 'Vacation Escape',
    description: 'Expensive reset with big mental health upside.',
    category: 'advanced',
    weight: (player) => (player.cash >= 3000 ? 2 : 0),
  },
  {
    id: 'startup_bet',
    label: 'Startup Bet',
    description: 'High-variance money move with bigger swings.',
    category: 'advanced',
    weight: (player) => (player.cash >= 2000 || player.assetsValue >= 2500 ? 1.7 : 0),
  },
  {
    id: 'festival_weekend',
    label: 'Festival Weekend',
    description: 'Mental relief, but with notable spending risk.',
    category: 'advanced',
    weight: (player) => (player.mentalHealth <= 65 || player.stress >= 35 ? 1.6 : 0),
  },
]

const toIssueAction = (issue) => ({
  id: `address_issue:${issue.id}`,
  label: `Address: ${issue.label}`,
  description: `Resolve now. Ignoring compounds (${issue.stackCount} stack${issue.stackCount === 1 ? '' : 's'}).`,
  category: 'unexpected',
})

const withEffectPreview = (action, player) => ({
  ...action,
  effectPreview: getActionPotentialEffects({ actionType: action.id, player }),
})

const weightedPick = (rng, weightedEntries) => {
  const totalWeight = weightedEntries.reduce((sum, entry) => sum + entry.weight, 0)
  if (totalWeight <= 0) {
    return null
  }
  const roll = rng() * totalWeight
  let cursor = 0
  for (const entry of weightedEntries) {
    cursor += entry.weight
    if (roll <= cursor) {
      return entry
    }
  }
  return weightedEntries[weightedEntries.length - 1] || null
}

export const getAvailableTurnActions = ({ game, player, turnNumber }) => {
  const normalizedPlayer = normalizePlayerState(player, game?.modifierContext)
  const regularActions = REGULAR_ACTIONS.map((action) => withEffectPreview(action, normalizedPlayer))
  const unexpectedActions = (normalizedPlayer.activeIssues || [])
    .map(toIssueAction)
    .map((action) => withEffectPreview(action, normalizedPlayer))

  const rng = createSeededRng(`${game?.seed || game?.id || 'game'}:offer:${turnNumber}:${normalizedPlayer.id}`)
  const baseChance = 0.1
  const chanceBonus = (normalizedPlayer.cash >= 3000 ? 0.03 : 0) + (normalizedPlayer.stress >= 45 ? 0.02 : 0)
  const advancedChance = Math.max(0.03, Math.min(0.22, baseChance + chanceBonus))
  const shouldOfferAdvanced = rng() < advancedChance

  let advancedActions = []
  if (shouldOfferAdvanced) {
    const weighted = ADVANCED_ACTIONS.map((action) => ({ ...action, weight: action.weight(normalizedPlayer) })).filter(
      (entry) => entry.weight > 0,
    )
    const selected = weightedPick(rng, weighted)
    if (selected) {
      advancedActions = [withEffectPreview(selected, normalizedPlayer)]
    }
  }

  return {
    regularActions,
    advancedActions,
    unexpectedActions,
  }
}
