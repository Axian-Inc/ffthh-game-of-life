import citySkyline from '../assets/wizard/city-skyline.svg'
import collegePath from '../assets/wizard/college-path.svg'
import tradeTools from '../assets/wizard/trade-tools.svg'
import creatorWave from '../assets/wizard/creator-wave.svg'

export const CITY_OPTIONS = [
  {
    id: 'san-francisco',
    title: 'San Francisco, CA',
    kicker: 'Big opportunities, big bills',
    description: 'Tech-heavy market with higher wages and higher monthly costs.',
    facts: ['Cost of Living: High', 'Taxes: Higher', 'Opportunity: High'],
    art: citySkyline,
  },
  {
    id: 'austin',
    title: 'Austin, TX',
    kicker: 'Balanced momentum',
    description: 'Fast growth with moderate costs and strong job variety.',
    facts: ['Cost of Living: Medium', 'Taxes: Medium', 'Opportunity: Medium-High'],
    art: citySkyline,
  },
  {
    id: 'des-moines',
    title: 'Des Moines, IA',
    kicker: 'Steady and affordable',
    description: 'Lower monthly costs with stable growth and less competition.',
    facts: ['Cost of Living: Lower', 'Taxes: Lower', 'Opportunity: Medium'],
    art: citySkyline,
  },
]

export const EDUCATION_TRACK_OPTIONS = [
  {
    id: 'degree-track',
    title: 'Degree Track',
    kicker: 'Invest now, unlock later',
    description: 'Higher upfront debt with stronger long-term income upside.',
    facts: ['Start Debt: Higher', 'Income Potential: High', 'Stability: Medium'],
    art: collegePath,
  },
  {
    id: 'trades-track',
    title: 'Trades Track',
    kicker: 'Earn sooner',
    description: 'Low debt and practical skills with consistent pay growth.',
    facts: ['Start Debt: Low', 'Income Potential: Medium-High', 'Stability: High'],
    art: tradeTools,
  },
  {
    id: 'street-smart',
    title: 'Street Smart',
    kicker: 'Learn by doing',
    description: 'No school debt with flexible paths and higher income swings.',
    facts: ['Start Debt: None', 'Income Potential: Variable', 'Stability: Variable'],
    art: creatorWave,
  },
]

export const JOB_OPTIONS = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    subtitle: 'Build products and solve technical problems',
    income: '$1,450 / month',
    careerTrack: 'Degree Track',
    art: collegePath,
  },
  {
    id: 'electrician',
    title: 'Electrician',
    subtitle: 'Install and maintain critical systems',
    income: '$1,320 / month',
    careerTrack: 'Trades Track',
    art: tradeTools,
  },
  {
    id: 'content-creator',
    title: 'Content Creator',
    subtitle: 'Grow an audience with digital storytelling',
    income: '$1,100 / month',
    careerTrack: 'Street Smart',
    art: creatorWave,
  },
]

export const findById = (items, id) => items.find((item) => item.id === id) || null
