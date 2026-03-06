import degreeTrackIcon from 'openmoji/color/svg/1F393.svg'
import tradesTrackIcon from 'openmoji/color/svg/1F6E0.svg'
import creatorTrackIcon from 'openmoji/color/svg/1F5A5.svg'
import { wizardCareerArt } from '../assets/wizard/art'

export const WIZARD_CITY_OPTIONS = [
  {
    id: 'san-francisco',
    label: 'San Francisco',
    badge: 'SF',
    costLabel: 'Cost',
    costItems: ['2.5x Cost of Living', '9% Tax'],
    opportunityLabel: 'Opportunity',
    opportunityItems: ['3x Growth'],
    wellbeingLabel: 'Wellbeing',
    wellbeingItems: ['Mental Baseline: +5', 'Physical Baseline: +2'],
    description:
      'A dense urban environment with vibrant culture and tech jobs, but very high living expenses.',
  },
  {
    id: 'denver',
    label: 'Denver',
    badge: 'DN',
    costLabel: 'Cost',
    costItems: ['1.2x Cost of Living', '5% Tax'],
    opportunityLabel: 'Opportunity',
    opportunityItems: ['1.5x Growth'],
    wellbeingLabel: 'Wellbeing',
    wellbeingItems: ['Mental +8', 'Physical +9'],
    description:
      'A balanced city with outdoor access, moderate opportunity, and a good mix of growth and affordability.',
  },
  {
    id: 'tonopah',
    label: 'Tonopah, NV',
    badge: 'TN',
    costLabel: 'Cost',
    costItems: ['0.7x Cost of Living', '2% Tax'],
    opportunityLabel: 'Opportunity',
    opportunityItems: ['0.5x Growth'],
    wellbeingLabel: 'Wellbeing',
    wellbeingItems: ['Mental +2', 'Physical +3'],
    description:
      'A quiet rural town with very low expenses but limited job prospects. Best for a simple life.',
  },
]

export const WIZARD_TRACK_OPTIONS = [
  {
    id: 'degree-track',
    label: 'Degree Track',
    iconSrc: degreeTrackIcon,
    debtLabel: 'Debt/Investment',
    debtItems: ['High student debt.', 'Delayed income.'],
    potentialLabel: 'Long-Term Potential',
    potentialItems: ['Great. Access to specialized professional roles.'],
    stabilityLabel: 'Stability',
    stabilityItems: ['High.'],
    description:
      'Formal university education for specialized professions. Significant up-front investment but strong career path.',
  },
  {
    id: 'trades-track',
    label: 'Trades Track',
    iconSrc: tradesTrackIcon,
    debtLabel: 'Debt/Investment',
    debtItems: ['Lower than Degree Track.', 'Practical training.'],
    potentialLabel: 'Long-Term Potential',
    potentialItems: ['Good. In-demand, skilled technical skills.'],
    stabilityLabel: 'Stability',
    stabilityItems: ['High.'],
    description:
      'Vocational training for high-demand skilled trades. Lower cost and faster entry into a good income.',
  },
  {
    id: 'self-taught-track',
    label: 'Self-Taught Track',
    iconSrc: creatorTrackIcon,
    debtLabel: 'Debt/Investment',
    debtItems: ['Minimal financial debt.', 'Self-driven learning.'],
    potentialLabel: 'Long-Term Potential',
    potentialItems: ['Great. Highly variable outcomes.'],
    stabilityLabel: 'Stability',
    stabilityItems: ['Variable.'],
    description:
      'Rely on self-driven learning and practical experience. Minimal up-front cost, but outcomes depend heavily on initiative.',
  },
]

export const WIZARD_JOB_OPTIONS = [
  {
    id: 'dental-hygienist',
    label: 'Dental Hygienist',
    income: '$77,000 / yr',
    stability: 'High',
    wageGrowth: 'Good (further specialization options)',
    careerTrack: 'Degree Track',
    artSrc: wizardCareerArt['dental-hygienist'],
  },
  {
    id: 'electrician',
    label: 'Electrician',
    income: '$60,000 / yr',
    stability: 'High',
    wageGrowth: 'High (master electrician license track)',
    careerTrack: 'Trades Track',
    artSrc: wizardCareerArt.electrician,
  },
  {
    id: 'mechanic',
    label: 'Mechanic',
    income: '$42,000 / yr',
    stability: 'High',
    wageGrowth: 'Good (ASE certification track)',
    careerTrack: 'Trades Track',
    artSrc: wizardCareerArt.mechanic,
  },
]

export const getWizardCityOption = (cityId) => WIZARD_CITY_OPTIONS.find((city) => city.id === cityId) || null

export const getWizardTrackOption = (trackId) => WIZARD_TRACK_OPTIONS.find((track) => track.id === trackId) || null

export const getWizardJobOption = (jobId) => WIZARD_JOB_OPTIONS.find((job) => job.id === jobId) || null
