export const ACTION_DEFINITIONS = [
  {
    id: 'study-or-school',
    label: 'Study or School',
    category: 'Career',
    description: 'Build long-term career options while taking on short-term pressure.',
  },
  {
    id: 'job-training',
    label: 'Job Training',
    category: 'Career',
    description: 'Improve earning potential with focused skill development.',
  },
  {
    id: 'invest-in-stocks',
    label: 'Invest in Stocks',
    category: 'Money',
    description: 'Put cash into a higher-risk investment for possible future growth.',
  },
  {
    id: 'invest-in-bonds',
    label: 'Invest in Bonds',
    category: 'Money',
    description: 'Put cash into a steadier investment with lower expected volatility.',
  },
  {
    id: 'join-gym',
    label: 'Join Gym',
    category: 'Health',
    description: 'Commit time and money toward better physical health.',
  },
  {
    id: 'join-sports-team',
    label: 'Join Sports Team',
    category: 'Health',
    description: 'Improve physical health and social connection through regular activity.',
  },
  {
    id: 'spend-time-with-family-or-friends',
    label: 'Spend Time with Family or Friends',
    category: 'Relationships',
    description: 'Invest time in relationships that can support mental health.',
  },
  {
    id: 'buy-smartphone',
    label: 'Buy Smartphone',
    category: 'Lifestyle',
    description: 'Buy a useful tool that may unlock future opportunities and distractions.',
  },
  {
    id: 'relocate-city',
    label: 'Relocate City',
    category: 'Location',
    description: 'Move to a new city with different costs, taxes, and opportunities.',
  },
  {
    id: 'look-for-love',
    label: 'Look for Love',
    category: 'Relationships',
    description: 'Spend time seeking a relationship with uncertain emotional outcomes.',
  },
  {
    id: 'buy-home',
    label: 'Buy Home',
    category: 'Housing',
    description: 'Try to build home equity while taking on housing responsibility.',
  },
  {
    id: 'home-maintenance',
    label: 'Home Maintenance',
    category: 'Housing',
    description: 'Protect home value by spending on repairs and upkeep.',
  },
  {
    id: 'debt-paydown',
    label: 'Debt Paydown',
    category: 'Money',
    description: 'Use extra cash to reduce debt and future interest pressure.',
  },
  {
    id: 'side-gig',
    label: 'Side Gig',
    category: 'Money',
    description: 'Trade time and energy for extra income this month.',
  },
  {
    id: 'career-switch',
    label: 'Career Switch',
    category: 'Career',
    description: 'Explore a new career path with transition costs and uncertainty.',
  },
]

export const ACTION_DEFINITION_BY_ID = Object.fromEntries(
  ACTION_DEFINITIONS.map((action) => [action.id, action]),
)
