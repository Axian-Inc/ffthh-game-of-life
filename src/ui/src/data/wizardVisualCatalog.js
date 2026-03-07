import { WIZARD_ART } from '../assets/wizard/art'

export const CITY_OPTIONS = [
  {
    id: 'san-francisco',
    title: 'San Francisco, CA',
    kicker: 'Big opportunities, big bills',
    description: 'Tech-heavy market with higher wages and higher monthly costs.',
    facts: ['Cost of Living: High', 'Taxes: Higher', 'Opportunity: High'],
    art: WIZARD_ART.citySkyline,
  },
  {
    id: 'austin',
    title: 'Austin, TX',
    kicker: 'Balanced momentum',
    description: 'Fast growth with moderate costs and strong job variety.',
    facts: ['Cost of Living: Medium', 'Taxes: Medium', 'Opportunity: Medium-High'],
    art: WIZARD_ART.citySkyline,
  },
  {
    id: 'des-moines',
    title: 'Des Moines, IA',
    kicker: 'Steady and affordable',
    description: 'Lower monthly costs with stable growth and less competition.',
    facts: ['Cost of Living: Lower', 'Taxes: Lower', 'Opportunity: Medium'],
    art: WIZARD_ART.citySkyline,
  },
]

export const EDUCATION_TRACK_OPTIONS = [
  {
    id: 'degree-track',
    title: 'Degree Track',
    kicker: 'Invest now, unlock later',
    description: 'Higher upfront debt with stronger long-term income upside.',
    facts: ['Start Debt: Higher', 'Income Potential: High', 'Stability: Medium'],
    art: WIZARD_ART.collegePath,
  },
  {
    id: 'trades-track',
    title: 'Trades Track',
    kicker: 'Earn sooner',
    description: 'Low debt and practical skills with consistent pay growth.',
    facts: ['Start Debt: Low', 'Income Potential: Medium-High', 'Stability: High'],
    art: WIZARD_ART.tradeTools,
  },
  {
    id: 'street-smart',
    title: 'Street Smart',
    kicker: 'Learn by doing',
    description: 'No school debt with flexible paths and higher income swings.',
    facts: ['Start Debt: None', 'Income Potential: Variable', 'Stability: Variable'],
    art: WIZARD_ART.creatorWave,
  },
]

export const JOB_OPTIONS = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    subtitle: 'Build products and solve technical problems',
    income: '$1,450 / month',
    careerTrack: 'Degree Track',
    art: WIZARD_ART.collegePath,
  },
  {
    id: 'electrician',
    title: 'Electrician',
    subtitle: 'Install and maintain critical systems',
    income: '$1,320 / month',
    careerTrack: 'Trades Track',
    art: WIZARD_ART.tradeTools,
  },
  {
    id: 'content-creator',
    title: 'Content Creator',
    subtitle: 'Grow an audience with digital storytelling',
    income: '$1,100 / month',
    careerTrack: 'Street Smart',
    art: WIZARD_ART.creatorWave,
  },
]

export const findById = (items, id) => items.find((item) => item.id === id) || null
