import {
  getCareerRule,
  getCityRule,
  getPlayerProfileRule,
  resolveWorldSettingsEffects,
} from './definitions'
import { randomIntInclusive, createSeededRng } from './random'
import { computeNetWorth, normalizePlayerState } from './playerState'
import { computeActionPoints, getActionDefinition, getActionLabel } from './actionCatalog'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const ACTION_BASE_EFFECTS = {
  pass: { cash: 0, debt: 0, assetsValue: 0, physicalHealth: -1, mentalHealth: -1, stress: 2 },
  choose_action: { cash: -100, debt: 0, assetsValue: 60, physicalHealth: 1, mentalHealth: 1, stress: -1 },
  workout: { cash: -90, debt: 0, assetsValue: 0, physicalHealth: 3, mentalHealth: 1, stress: -2 },
  study: { cash: -280, debt: 85, assetsValue: 20, physicalHealth: -1, mentalHealth: 1, stress: 1 },
  side_gig: { cash: 260, debt: 0, assetsValue: 20, physicalHealth: -1, mentalHealth: -1, stress: 2 },
  debt_paydown: { cash: -220, debt: -280, assetsValue: 0, physicalHealth: 0, mentalHealth: 1, stress: -1 },
  social_time: { cash: -120, debt: 0, assetsValue: 0, physicalHealth: 0, mentalHealth: 3, stress: -2 },
  vacation_escape: { cash: -900, debt: 0, assetsValue: 0, physicalHealth: 1, mentalHealth: 5, stress: -4 },
  startup_bet: { cash: -700, debt: 0, assetsValue: 500, physicalHealth: 0, mentalHealth: 0, stress: 2 },
  festival_weekend: { cash: -350, debt: 0, assetsValue: 0, physicalHealth: 0, mentalHealth: 4, stress: -3 },
}

const ISSUE_CATALOG = [
  {
    id: 'car_breakdown',
    label: 'Car Breakdown',
    headline: 'Your car dies at the worst possible moment.',
    spawnChance: 0.07,
    ignore: { cash: -120, stress: 1 },
    address: { cash: -450, stress: 1 },
  },
  {
    id: 'plumbing_leak',
    label: 'Plumbing Leak',
    headline: 'A small leak is becoming a bigger home problem.',
    spawnChance: 0.06,
    ignore: { cash: -90, mentalHealth: -1 },
    address: { cash: -380, stress: 1 },
  },
  {
    id: 'burnout_warning',
    label: 'Burnout Warning',
    headline: 'You have been running on fumes for weeks.',
    spawnChance: 0.05,
    ignore: { mentalHealth: -2, stress: 2, physicalHealth: -1 },
    address: { cash: -140, mentalHealth: 2, stress: -2 },
  },
]

const FEATURED_EVENTS = [
  {
    id: 'small_bonus',
    label: 'Unexpected Bonus',
    headline: 'A little extra money lands in your lap.',
    body: 'You caught a lucky break and it eases the month a bit.',
    tone: 'good',
    weight: (player) => (player.stress <= 55 ? 1.2 : 0.4),
    delta: (rng) => ({ cash: randomIntInclusive(rng, 180, 520), debt: 0, assetsValue: 0, physicalHealth: 0, mentalHealth: 1, stress: -1 }),
  },
  {
    id: 'dog_sick',
    label: 'Pet Emergency',
    headline: 'Your dog gets sick and needs care.',
    body: 'It is emotionally heavy and a little expensive.',
    tone: 'bad',
    weight: () => 0.9,
    delta: (rng) => ({ cash: randomIntInclusive(rng, -420, -180), debt: 0, assetsValue: 0, physicalHealth: 0, mentalHealth: -1, stress: 2 }),
  },
  {
    id: 'friend_opportunity',
    label: 'Friend Connection',
    headline: 'A friend opens a surprising opportunity.',
    body: 'It could help your career if you have the energy to chase it.',
    tone: 'neutral',
    weight: (player) => (player.mentalHealth >= 55 ? 1.1 : 0.5),
    delta: (rng) => ({ cash: randomIntInclusive(rng, -80, 140), debt: 0, assetsValue: randomIntInclusive(rng, 0, 120), physicalHealth: 0, mentalHealth: 1, stress: 0 }),
  },
]

const createEmptyDelta = () => ({
  cash: 0,
  debt: 0,
  assetsValue: 0,
  physicalHealth: 0,
  mentalHealth: 0,
  stress: 0,
})

const applyDelta = (state, delta) => ({
  ...state,
  cash: Math.round(state.cash + (delta.cash || 0)),
  debt: clamp(Math.round(state.debt + (delta.debt || 0)), 0, Number.MAX_SAFE_INTEGER),
  assetsValue: clamp(Math.round(state.assetsValue + (delta.assetsValue || 0)), 0, Number.MAX_SAFE_INTEGER),
  physicalHealth: clamp(Math.round(state.physicalHealth + (delta.physicalHealth || 0)), 0, 100),
  mentalHealth: clamp(Math.round(state.mentalHealth + (delta.mentalHealth || 0)), 0, 100),
  stress: clamp(Math.round(state.stress + (delta.stress || 0)), 0, 100),
})

const mergeDelta = (target, source) => {
  Object.keys(target).forEach((key) => {
    target[key] += source[key] || 0
  })
  return target
}

const scaleIssuePenalty = (delta, stackCount) => {
  const multiplier = Math.pow(1.2, Math.max(0, stackCount))
  return {
    cash: Math.max(-450, Math.round((delta.cash || 0) * multiplier)),
    debt: Math.round((delta.debt || 0) * multiplier),
    assetsValue: Math.round((delta.assetsValue || 0) * multiplier),
    physicalHealth: Math.max(-4, Math.round((delta.physicalHealth || 0) * multiplier)),
    mentalHealth: Math.max(-4, Math.round((delta.mentalHealth || 0) * multiplier)),
    stress: Math.min(5, Math.round((delta.stress || 0) * multiplier)),
  }
}

const getRandomDelta = (rng, volatilityMultiplier) => ({
  cash: randomIntInclusive(rng, -120, 120) * volatilityMultiplier,
  debt: randomIntInclusive(rng, -35, 55) * volatilityMultiplier,
  assetsValue: randomIntInclusive(rng, -90, 130) * volatilityMultiplier,
  physicalHealth: randomIntInclusive(rng, -2, 2),
  mentalHealth: randomIntInclusive(rng, -2, 2),
  stress: randomIntInclusive(rng, -2, 2),
})

const parseIssueActionType = (actionType) => {
  if (!String(actionType).startsWith('address_issue:')) {
    return null
  }
  return String(actionType).slice('address_issue:'.length)
}

const pickFeaturedEvent = (rng, player) => {
  let chance = 0.35
  if (player.stress >= 65 || player.debt > player.monthlyIncome * 2) {
    chance += 0.1
  }
  if (player.stress <= 30 && player.physicalHealth >= 70 && player.mentalHealth >= 70) {
    chance -= 0.05
  }
  chance = Math.max(0.15, Math.min(0.55, chance))
  if (rng() > chance) {
    return null
  }

  const weighted = FEATURED_EVENTS.map((event) => ({ ...event, effectiveWeight: event.weight(player) })).filter(
    (event) => event.effectiveWeight > 0,
  )
  const totalWeight = weighted.reduce((sum, event) => sum + event.effectiveWeight, 0)
  if (totalWeight <= 0) {
    return null
  }
  let roll = rng() * totalWeight
  for (const event of weighted) {
    roll -= event.effectiveWeight
    if (roll <= 0) {
      return event
    }
  }
  return weighted[weighted.length - 1] || null
}

const queueDelayedConsequences = ({ selectedActions, player, turnNumber, rng }) => {
  const queued = []

  const push = (consequence) => {
    queued.push({
      id: `${consequence.type}-${turnNumber}-${queued.length}`,
      ...consequence,
    })
  }

  selectedActions.forEach((actionType, index) => {
    if (actionType === 'workout' && rng() < 0.18) {
      push({
        type: 'workout_strain',
        sourceActionType: actionType,
        label: 'Workout Strain',
        headline: 'You pushed too hard and wake up stiff and limping.',
        hint: 'You might be overdoing it physically.',
        revealOnTurnNumber: turnNumber + 1,
        tone: 'bad',
        delta: { cash: 0, debt: 0, assetsValue: 0, physicalHealth: -2, mentalHealth: 0, stress: 1 },
        explanation: 'A hard workout can backfire when recovery is thin.',
      })
    }
    if (actionType === 'study' && rng() < 0.55) {
      push({
        type: 'study_payoff',
        sourceActionType: actionType,
        label: 'Learning Pays Off',
        headline: 'The work you put in starts to click.',
        hint: 'This might open a door next month.',
        revealOnTurnNumber: turnNumber + 1,
        tone: 'good',
        delta: { cash: 180, debt: 0, assetsValue: 60, physicalHealth: 0, mentalHealth: 1, stress: -1 },
        explanation: 'Skills tend to compound when you keep showing up.',
      })
    }
    if (actionType === 'side_gig' && rng() < 0.35) {
      push({
        type: 'side_gig_fatigue',
        sourceActionType: actionType,
        label: 'Side-Gig Fatigue',
        headline: 'The extra work is starting to wear on you.',
        hint: 'You may feel the drag next month.',
        revealOnTurnNumber: turnNumber + 1,
        tone: 'bad',
        delta: { cash: 0, debt: 0, assetsValue: 0, physicalHealth: -1, mentalHealth: -1, stress: 2 },
        explanation: 'Extra cash can come with delayed exhaustion.',
      })
    }
    if (actionType === 'startup_bet') {
      const positive = rng() < 0.5
      push({
        type: positive ? 'startup_boom' : 'startup_bust',
        sourceActionType: actionType,
        label: positive ? 'Startup Pop' : 'Startup Bust',
        headline: positive ? 'Your risky bet starts to look brilliant.' : 'The big gamble starts wobbling fast.',
        hint: 'This could boom or blow up later.',
        revealOnTurnNumber: turnNumber + 1 + index,
        tone: positive ? 'good' : 'bad',
        delta: positive
          ? { cash: 220, debt: 0, assetsValue: 680, physicalHealth: 0, mentalHealth: 1, stress: -1 }
          : { cash: -180, debt: 120, assetsValue: -520, physicalHealth: 0, mentalHealth: -1, stress: 2 },
        explanation: 'High-variance bets often finish their story later.',
      })
    }
    if (actionType === 'festival_weekend' && rng() < 0.3) {
      push({
        type: 'festival_hangover',
        sourceActionType: actionType,
        label: 'Festival Hangover',
        headline: 'The fun was real, and so is the aftermath.',
        hint: 'Fun now can still leave a mess for later.',
        revealOnTurnNumber: turnNumber + 1,
        tone: 'bad',
        delta: { cash: -60, debt: 0, assetsValue: 0, physicalHealth: -1, mentalHealth: 0, stress: 1 },
        explanation: 'Big weekends can echo into the next month.',
      })
    }
    if (actionType === 'social_time' && rng() < 0.35) {
      push({
        type: 'friend_support',
        sourceActionType: actionType,
        label: 'Support Shows Up',
        headline: 'Someone remembers what you are carrying and checks in.',
        hint: 'Your support system may help next month.',
        revealOnTurnNumber: turnNumber + 1,
        tone: 'good',
        delta: { cash: 0, debt: 0, assetsValue: 0, physicalHealth: 0, mentalHealth: 2, stress: -1 },
        explanation: 'Relationships often pay back later, not instantly.',
      })
    }
  })

  return queued
}

const updateProgressionArcs = (player, selectedActions) => {
  const byId = new Map((player.progressionArcs || []).map((arc) => [arc.id, arc]))
  const burnout = byId.get('burnout') || { id: 'burnout', label: 'Burnout', value: 0 }
  const recovery = byId.get('recovery') || { id: 'recovery', label: 'Recovery', value: 0 }
  const careerMomentum = byId.get('careerMomentum') || { id: 'careerMomentum', label: 'Career Momentum', value: 0 }

  burnout.value = clamp(
    burnout.value +
      (player.stress >= 60 ? 1 : -1) +
      (selectedActions.includes('side_gig') ? 1 : 0) +
      (selectedActions.includes('workout') || selectedActions.includes('social_time') ? -1 : 0),
    0,
    6,
  )
  recovery.value = clamp(
    recovery.value +
      (selectedActions.includes('workout') ? 1 : 0) +
      (selectedActions.includes('social_time') ? 1 : 0) +
      (player.stress <= 35 ? 1 : 0) -
      (player.stress >= 65 ? 1 : 0),
    0,
    6,
  )
  careerMomentum.value = clamp(
    careerMomentum.value +
      (selectedActions.includes('study') ? 1 : 0) +
      (selectedActions.includes('side_gig') ? 1 : 0) +
      (selectedActions.includes('startup_bet') ? 1 : 0),
    0,
    6,
  )

  const decorate = (arc) => {
    if (arc.id === 'burnout') {
      const band = arc.value >= 5 ? 'critical' : arc.value >= 3 ? 'rising' : arc.value > 0 ? 'noticeable' : 'calm'
      const headline =
        band === 'critical'
          ? 'Burnout is now steering your month.'
          : band === 'rising'
            ? 'Pressure is building into a pattern.'
            : band === 'noticeable'
              ? 'Stress is lingering instead of clearing.'
              : 'You are keeping up with life.'
      return { ...arc, band, headline }
    }
    if (arc.id === 'recovery') {
      const band = arc.value >= 4 ? 'strong' : arc.value >= 2 ? 'building' : arc.value > 0 ? 'steady' : 'flat'
      const headline =
        band === 'strong'
          ? 'Your recovery habits are finally compounding.'
          : band === 'building'
            ? 'You are starting to feel the benefits of consistency.'
            : band === 'steady'
              ? 'You are making small but real repairs.'
              : 'You are holding your ground.'
      return { ...arc, band, headline }
    }
    const band = arc.value >= 4 ? 'surging' : arc.value >= 2 ? 'building' : arc.value > 0 ? 'steady' : 'flat'
    const headline =
      band === 'surging'
        ? 'Your career momentum is opening sharper opportunities.'
        : band === 'building'
          ? 'Your long-term effort is starting to show.'
          : band === 'steady'
            ? 'Your career is moving, even if slowly.'
            : 'Your career is moving at a steady pace.'
    return { ...arc, band, headline }
  }

  return [decorate(burnout), decorate(recovery), decorate(careerMomentum)]
}

const buildTopCallouts = ({ selectedActions, totalDelta, featuredEvent, revealedConsequences, issuePenaltyApplied }) => {
  const callouts = []

  if (featuredEvent) {
    callouts.push(featuredEvent.body)
  }
  if (revealedConsequences.length > 0) {
    callouts.push(revealedConsequences[0].explanation)
  }
  if (selectedActions.includes('debt_paydown')) {
    callouts.push('Putting money toward debt should soften future pressure.')
  }
  if (selectedActions.includes('study')) {
    callouts.push('You traded comfort now for a better shot at future momentum.')
  }
  if (selectedActions.includes('startup_bet')) {
    callouts.push('The risky swing changed this month and may still surprise you later.')
  }
  if (issuePenaltyApplied) {
    callouts.push('Ignoring active problems is starting to snowball into bigger costs.')
  }

  if (callouts.length < 3) {
    if (totalDelta.netWorth > 0) {
      callouts.push('Your finances moved forward this month.')
    } else if (totalDelta.netWorth < 0) {
      callouts.push('This month cost more than it gave back.')
    }
  }

  if (callouts.length < 3) {
    if (totalDelta.stress > 0) {
      callouts.push('You ended the month carrying more pressure into the next one.')
    } else if (totalDelta.stress < 0) {
      callouts.push('You managed to carve out a little breathing room.')
    }
  }

  return callouts.slice(0, 3)
}

const buildMonthHeadline = ({ totalDelta, featuredEvent, revealedConsequences }) => {
  if (revealedConsequences[0]?.headline) {
    return revealedConsequences[0].headline
  }
  if (featuredEvent?.headline) {
    return featuredEvent.headline
  }
  if (totalDelta.netWorth >= 300) {
    return 'The month rewarded your momentum.'
  }
  if (totalDelta.netWorth <= -300) {
    return 'The month pressed hard on your finances.'
  }
  if (totalDelta.stress >= 3) {
    return 'The month got heavier than you wanted.'
  }
  if (totalDelta.mentalHealth >= 2 || totalDelta.physicalHealth >= 2) {
    return 'You found a little ground again this month.'
  }
  return 'Life kept moving, and now you set up what comes next.'
}

export const resolvePlayerTurn = ({ game, player, selectedActions = [], actionType, turnNumber, playerName }) => {
  const normalizedPlayer = normalizePlayerState(player, game?.modifierContext)
  const modifierContext = game?.modifierContext || {}
  const worldEffects = resolveWorldSettingsEffects(modifierContext.worldSettings)
  const cityRule = getCityRule(normalizedPlayer.cityId)
  const careerRule = getCareerRule(normalizedPlayer.jobId)
  const profileRule = getPlayerProfileRule(normalizedPlayer.profileId)
  const baseSeed = `${game?.seed || game?.id || 'game'}:${turnNumber}:${normalizedPlayer.id}:${selectedActions.join('|') || 'end_turn'}`
  const rng = createSeededRng(baseSeed)

  const actionPointsStart = computeActionPoints(normalizedPlayer)
  const resolvedSelectedActions =
    Array.isArray(selectedActions) && selectedActions.length > 0
      ? selectedActions
      : typeof actionType === 'string' && actionType !== 'pass'
        ? [actionType]
        : []
  const sanitizedActions = Array.isArray(resolvedSelectedActions)
    ? resolvedSelectedActions.filter((nextActionType) => typeof nextActionType === 'string' && nextActionType.trim())
    : []

  const actionsTaken = []
  let actionPointsSpent = 0
  sanitizedActions.forEach((actionType) => {
    const definition = getActionDefinition(actionType)
    const apCost = definition?.apCost || (String(actionType).startsWith('address_issue:') ? 2 : 0)
    if (actionPointsSpent + apCost <= actionPointsStart) {
      actionPointsSpent += apCost
      actionsTaken.push(actionType)
    }
  })

  const preTurn = {
    cash: normalizedPlayer.cash,
    debt: normalizedPlayer.debt,
    assetsValue: normalizedPlayer.assetsValue,
    netWorth: normalizedPlayer.netWorth,
    monthlyIncome: normalizedPlayer.monthlyIncome,
    physicalHealth: normalizedPlayer.physicalHealth,
    mentalHealth: normalizedPlayer.mentalHealth,
    stress: normalizedPlayer.stress,
  }

  let next = {
    ...normalizedPlayer,
    activeIssues: Array.isArray(normalizedPlayer.activeIssues) ? [...normalizedPlayer.activeIssues] : [],
    pendingConsequences: Array.isArray(normalizedPlayer.pendingConsequences) ? [...normalizedPlayer.pendingConsequences] : [],
  }

  const phaseDeltas = []
  const recurringCosts = Math.round(careerRule.recurringCostBase * cityRule.costMultiplier * worldEffects.monthlyExpenseMultiplier)
  const grossIncome = Math.round(normalizedPlayer.monthlyIncome * worldEffects.incomeMultiplier)
  const lowMentalIncomeMultiplier =
    normalizedPlayer.mentalHealth < 40 && profileRule.lowMentalIncomeMultiplierBelow40
      ? profileRule.lowMentalIncomeMultiplierBelow40
      : 1
  const adjustedGrossIncome = Math.round(grossIncome * lowMentalIncomeMultiplier)
  const taxes = Math.round(adjustedGrossIncome * cityRule.taxRate)
  const netIncome = adjustedGrossIncome - taxes
  const debtInterest = Math.round(normalizedPlayer.debt * 0.0125)
  const minimumDebtPayment =
    normalizedPlayer.debt > 0
      ? Math.max(75, Math.round(normalizedPlayer.debt * 0.02 * (profileRule.debtPaymentMultiplier || 1)))
      : 0

  const financialBaseDelta = {
    cash: netIncome - recurringCosts - minimumDebtPayment,
    debt: debtInterest - minimumDebtPayment,
    assetsValue: 0,
    physicalHealth: 0,
    mentalHealth: 0,
    stress: 0,
  }
  next = applyDelta(next, financialBaseDelta)
  phaseDeltas.push({ phase: 'financial', delta: financialBaseDelta, explanation: 'Income, taxes, recurring costs, and debt minimum applied.' })

  const healthBaseDelta = {
    cash: 0,
    debt: 0,
    assetsValue: 0,
    physicalHealth: careerRule.physicalDrift + cityRule.physicalDrift + worldEffects.physicalDriftBonus,
    mentalHealth: careerRule.mentalDrift + cityRule.mentalDrift + worldEffects.mentalDriftBonus,
    stress: careerRule.stressDrift + worldEffects.stressDriftBonus,
  }
  if (next.debt > Math.max(5000, next.monthlyIncome * 2)) {
    healthBaseDelta.mentalHealth -= 1
    healthBaseDelta.stress += 1
  }
  next = applyDelta(next, healthBaseDelta)
  phaseDeltas.push({ phase: 'health', delta: healthBaseDelta, explanation: 'Career, city, and debt-pressure drift applied.' })

  const revealedConsequences = next.pendingConsequences.filter((consequence) => Number(consequence.revealOnTurnNumber) <= Number(turnNumber))
  next.pendingConsequences = next.pendingConsequences.filter((consequence) => Number(consequence.revealOnTurnNumber) > Number(turnNumber))
  if (revealedConsequences.length > 0) {
    const revealedDelta = revealedConsequences.reduce((delta, consequence) => mergeDelta(delta, consequence.delta || createEmptyDelta()), createEmptyDelta())
    next = applyDelta(next, revealedDelta)
    phaseDeltas.push({ phase: 'revealed_consequences', delta: revealedDelta, explanation: 'Delayed consequences from earlier choices landed this month.' })
  }

  const featuredEvent = pickFeaturedEvent(createSeededRng(`${baseSeed}:event`), next)
  if (featuredEvent) {
    const eventDelta = featuredEvent.delta(createSeededRng(`${baseSeed}:event-delta`))
    next = applyDelta(next, eventDelta)
    phaseDeltas.push({ phase: 'featured_event', delta: eventDelta, explanation: featuredEvent.body })
  }

  const actionEventLog = []
  for (const actionType of actionsTaken) {
    const addressedIssueId = parseIssueActionType(actionType)
    let actionDelta = createEmptyDelta()
    let effectiveActionType = actionType

    if (addressedIssueId) {
      const issue = next.activeIssues.find((entry) => entry.id === addressedIssueId)
      const issueRule = ISSUE_CATALOG.find((entry) => entry.id === issue?.issueType)
      if (issue && issueRule) {
        effectiveActionType = `address_issue:${issueRule.id}`
        actionDelta = {
          cash: issueRule.address.cash || 0,
          debt: issueRule.address.debt || 0,
          assetsValue: issueRule.address.assetsValue || 0,
          physicalHealth: issueRule.address.physicalHealth || 0,
          mentalHealth: issueRule.address.mentalHealth || 0,
          stress: issueRule.address.stress || 0,
        }
        next.activeIssues = next.activeIssues.filter((entry) => entry.id !== addressedIssueId)
      }
    } else {
      actionDelta = { ...(ACTION_BASE_EFFECTS[actionType] || createEmptyDelta()) }
      if (actionType === 'vacation_escape') {
        actionDelta.cash += randomIntInclusive(rng, -500, 0)
        actionDelta.mentalHealth += randomIntInclusive(rng, -2, 2)
      }
      if (actionType === 'startup_bet') {
        actionDelta.assetsValue += randomIntInclusive(rng, -800, 1400)
        actionDelta.mentalHealth += randomIntInclusive(rng, -1, 1)
      }
      if (actionType === 'festival_weekend') {
        actionDelta.cash += randomIntInclusive(rng, -250, 0)
        actionDelta.physicalHealth += randomIntInclusive(rng, -1, 1)
      }
    }

    next = applyDelta(next, actionDelta)
    phaseDeltas.push({
      phase: 'action_base',
      actionType: effectiveActionType,
      delta: actionDelta,
      explanation: `${getActionLabel(effectiveActionType.replace('address_issue:', ''))} changed the month.`,
    })
    actionEventLog.push({
      actionType: effectiveActionType,
      actionLabel: effectiveActionType.startsWith('address_issue:')
        ? `Address ${ISSUE_CATALOG.find((issue) => issue.id === effectiveActionType.slice('address_issue:'.length))?.label || 'Issue'}`
        : getActionLabel(effectiveActionType),
      apCost: getActionDefinition(actionType)?.apCost || 2,
    })
  }

  const issueTickDelta = createEmptyDelta()
  next.activeIssues = next.activeIssues.map((issue) => {
    const issueRule = ISSUE_CATALOG.find((entry) => entry.id === issue.issueType)
    if (!issueRule) {
      return issue
    }
    const tick = scaleIssuePenalty(issueRule.ignore, issue.stackCount || 0)
    mergeDelta(issueTickDelta, tick)
    return {
      ...issue,
      stackCount: Math.min(5, (issue.stackCount || 0) + 1),
      turnsActive: (issue.turnsActive || 0) + 1,
    }
  })
  let issuePenaltyApplied = false
  if (Object.values(issueTickDelta).some((value) => value !== 0)) {
    issuePenaltyApplied = true
    next = applyDelta(next, issueTickDelta)
    phaseDeltas.push({ phase: 'issue_tick', delta: issueTickDelta, explanation: 'Unresolved problems kept biting into the month.' })
  }

  const delayedConsequences = queueDelayedConsequences({
    selectedActions: actionsTaken,
    player: next,
    turnNumber,
    rng: createSeededRng(`${baseSeed}:delayed`),
  })
  next.pendingConsequences = [...next.pendingConsequences, ...delayedConsequences]

  const issueSpawnRng = createSeededRng(`${game?.seed || game?.id || 'game'}:issue:${turnNumber}:${normalizedPlayer.id}`)
  if (next.activeIssues.length < 2) {
    for (const issueRule of ISSUE_CATALOG) {
      if (next.activeIssues.some((issue) => issue.issueType === issueRule.id)) {
        continue
      }
      if (issueSpawnRng() < issueRule.spawnChance) {
        next.activeIssues.push({
          id: `${issueRule.id}-${turnNumber}`,
          issueType: issueRule.id,
          label: issueRule.label,
          headline: issueRule.headline,
          stackCount: 0,
          turnsActive: 0,
        })
        break
      }
    }
  }

  const combinedVolatilityMultiplier = worldEffects.randomVolatilityMultiplier * (profileRule.randomVolatilityMultiplier || 1)
  const randomDelta = getRandomDelta(rng, combinedVolatilityMultiplier)
  randomDelta.stress += profileRule.randomStressDeltaFlat || 0
  randomDelta.mentalHealth += profileRule.randomMentalDeltaFlat || 0
  next = applyDelta(next, randomDelta)
  phaseDeltas.push({ phase: 'random', delta: randomDelta, explanation: 'Life added a little unpredictability after your choices.' })

  next.progressionArcs = updateProgressionArcs(next, actionsTaken)
  next.netWorth = computeNetWorth({ cash: next.cash, assets: next.assetsValue, debt: next.debt })

  const totalDelta = {
    cash: next.cash - preTurn.cash,
    debt: next.debt - preTurn.debt,
    assetsValue: next.assetsValue - preTurn.assetsValue,
    netWorth: next.netWorth - preTurn.netWorth,
    physicalHealth: next.physicalHealth - preTurn.physicalHealth,
    mentalHealth: next.mentalHealth - preTurn.mentalHealth,
    stress: next.stress - preTurn.stress,
  }

  const topCallouts = buildTopCallouts({
    selectedActions: actionsTaken,
    totalDelta,
    featuredEvent,
    revealedConsequences,
    issuePenaltyApplied,
  })
  const monthHeadline = buildMonthHeadline({ totalDelta, featuredEvent, revealedConsequences })

  const turnLog = {
    id: `turn-${normalizedPlayer.id}-${turnNumber}-${Date.now()}`,
    playerId: normalizedPlayer.id,
    playerName,
    turnNumber,
    monthHeadline,
    actionPointsStart,
    actionPointsSpent,
    actionPointsRemaining: Math.max(0, actionPointsStart - actionPointsSpent),
    actionsTaken: actionEventLog,
    revealedConsequences,
    featuredEvent: featuredEvent
      ? {
          id: featuredEvent.id,
          label: featuredEvent.label,
          headline: featuredEvent.headline,
          body: featuredEvent.body,
          tone: featuredEvent.tone,
        }
      : null,
    preTurn,
    postTurn: {
      cash: next.cash,
      debt: next.debt,
      assetsValue: next.assetsValue,
      netWorth: next.netWorth,
      monthlyIncome: next.monthlyIncome,
      physicalHealth: next.physicalHealth,
      mentalHealth: next.mentalHealth,
      stress: next.stress,
      activeIssues: next.activeIssues,
      pendingConsequences: next.pendingConsequences,
      progressionArcs: next.progressionArcs,
    },
    phaseDeltas,
    totalDelta,
    topCallouts,
    queuedConsequencesPreview: delayedConsequences.map((consequence) => ({
      label: consequence.label,
      hint: consequence.hint,
      revealOnTurnNumber: consequence.revealOnTurnNumber,
      tone: consequence.tone,
    })),
    createdAt: Date.now(),
  }

  const actionHistoryEntry = {
    id: `action-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    actionType: actionsTaken[0] || 'end_turn',
    turnNumber,
    totalDelta,
    createdAt: Date.now(),
    actionsTaken: actionEventLog,
  }

  return {
    player: {
      ...next,
      actionHistory: [...(Array.isArray(next.actionHistory) ? next.actionHistory : []), actionHistoryEntry],
    },
    turnLog,
    totalDelta,
    actionLabel: actionEventLog.length > 0 ? actionEventLog.map((action) => action.actionLabel).join(' + ') : 'End Turn',
    actionType: actionsTaken[0] || 'end_turn',
  }
}
