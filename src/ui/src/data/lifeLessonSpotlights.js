const LIFE_LESSON_SPOTLIGHTS = [
  {
    id: 'tiny-tradeoffs',
    tone: 'steady',
    title: 'Tiny Tradeoff, Big Month',
    prompt: 'Choose one small habit to protect this month before chasing a bigger reward.',
    takeaway: 'Small choices compound faster when they are easy to repeat.',
  },
  {
    id: 'future-self',
    tone: 'bright',
    title: 'Future You Gets a Vote',
    prompt: 'Before spending action points, ask what next month will thank you for.',
    takeaway: 'Good plans balance today with the version of you who has to clean it up.',
  },
  {
    id: 'ask-for-help',
    tone: 'warm',
    title: 'Use Your Bench',
    prompt: 'Name one person or routine that could make this turn less lonely.',
    takeaway: 'Support is a strategy, not a shortcut.',
  },
  {
    id: 'energy-budget',
    tone: 'steady',
    title: 'Budget Your Energy Too',
    prompt: 'Money matters, but your physical and mental battery decide how well you can use it.',
    takeaway: 'The best move is sometimes the one that keeps you able to make more moves.',
  },
  {
    id: 'curiosity',
    tone: 'bright',
    title: 'Run a Small Experiment',
    prompt: 'Pick a low-risk choice that teaches you something even if it does not pay off immediately.',
    takeaway: 'Learning can be a return on investment.',
  },
]

const PRESSURE_SPOTLIGHT = {
  id: 'pressure-valve',
  tone: 'alert',
  title: 'Find the Pressure Valve',
  prompt: 'Stress is high. Spend at least one choice on lowering pressure before adding a new commitment.',
  takeaway: 'Relief now can prevent bigger costs later.',
}

const DEBT_SPOTLIGHT = {
  id: 'debt-snowball',
  tone: 'alert',
  title: 'Interest Never Sleeps',
  prompt: 'Debt is taking a seat at the table. Look for a move that slows the snowball.',
  takeaway: 'Paying down pressure buys future freedom.',
}

const HEALTH_SPOTLIGHT = {
  id: 'body-votes',
  tone: 'warm',
  title: 'Your Body Gets a Vote',
  prompt: 'Low health makes every other plan harder. Consider a choice that restores your baseline.',
  takeaway: 'Recovery is productive when it protects your options.',
}

export const getLifeLessonSpotlight = ({ player = {}, turnNumber = 1 } = {}) => {
  const stress = Number(player?.stress) || 0
  const debt = Number(player?.debt) || 0
  const physicalHealth = Number(player?.physicalHealth) || 0
  const mentalHealth = Number(player?.mentalHealth) || 0

  if (stress >= 65 || mentalHealth < 45) {
    return PRESSURE_SPOTLIGHT
  }

  if (debt >= 10000) {
    return DEBT_SPOTLIGHT
  }

  if (physicalHealth > 0 && physicalHealth < 50) {
    return HEALTH_SPOTLIGHT
  }

  const seed = [player?.id, player?.name, player?.cityId, player?.jobId, turnNumber].filter(Boolean).join('|')
  const score = Array.from(seed || 'life').reduce((sum, character) => sum + character.charCodeAt(0), 0)

  return LIFE_LESSON_SPOTLIGHTS[score % LIFE_LESSON_SPOTLIGHTS.length]
}
