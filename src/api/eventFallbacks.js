const FALLBACK_EVENTS = Object.freeze([
  Object.freeze({
    title: 'A neighbor shares a useful tip',
    narrative: 'A small piece of advice helps you save a little money this month.',
    outcome: 'positive',
    effect: Object.freeze({ metric: 'cash', amount: 100 }),
  }),
  Object.freeze({
    title: 'A quiet afternoon arrives',
    narrative: 'You take a steady day as it comes, with no major change to your plans.',
    outcome: 'neutral',
    effect: Object.freeze({ metric: 'mentalHealth', amount: 0 }),
  }),
  Object.freeze({
    title: 'An everyday repair comes up',
    narrative: 'A routine repair uses a small part of your savings, but you handle it.',
    outcome: 'negative',
    effect: Object.freeze({ metric: 'cash', amount: -100 }),
  }),
  Object.freeze({
    title: 'A walk brings fresh energy',
    narrative: 'Time outdoors leaves you feeling a little more refreshed.',
    outcome: 'positive',
    effect: Object.freeze({ metric: 'physicalHealth', amount: 2 }),
  }),
])

const hashText = (value) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const createFallbackEvent = ({ gameId, turnNumber, playerId }) => {
  const turnKey = `${String(gameId)}:${turnNumber}:${String(playerId)}`
  const selected = FALLBACK_EVENTS[hashText(turnKey) % FALLBACK_EVENTS.length]
  return {
    ...selected,
    effect: { ...selected.effect },
    source: {
      sourceId: 'reviewed-fallback-catalog',
      publisher: 'Modern Game of Life',
      headline: 'Reviewed family-safe event',
      publishedAt: null,
    },
    generationMode: 'fallback',
  }
}

module.exports = {
  FALLBACK_EVENTS,
  createFallbackEvent,
  hashText,
}
