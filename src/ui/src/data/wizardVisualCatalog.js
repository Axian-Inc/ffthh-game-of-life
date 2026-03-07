import { WIZARD_ART } from '../assets/wizard/art'

export const CITY_OPTIONS = [
  {
    id: 'san-francisco',
    label: 'San Francisco',
    icon: '🌉',
    art: WIZARD_ART.citySanFrancisco,
    cost: ['Cost of Living Multiplier: 2.5x', 'Tax Rate: 9%'],
    opportunity: ['Opportunity Multiplier: 3x'],
    wellbeing: ['Mental Baseline: +5', 'Physical Baseline: +2'],
    body:
      'A dense urban environment with vibrant culture and tech jobs, but very high living expenses. Remember, there is no free lunch-high reward comes with high cost.',
  },
  {
    id: 'denver',
    label: 'Denver',
    icon: '🏔️',
    art: WIZARD_ART.cityDenver,
    cost: ['1.2x CoL', '5% Tax'],
    opportunity: ['1.5x Growth'],
    wellbeing: ['Mental +8', 'Physical +9'],
    body:
      'A balanced city with outdoor access. Moderate CoL and good opportunity-a comfortable middle, but not an extreme. The tradeoff is less focus on any single area.',
  },
  {
    id: 'tonopah',
    label: 'Tonopah, NV',
    icon: '🏜️',
    art: WIZARD_ART.cityTonopah,
    cost: ['0.7x CoL', '2% Tax'],
    opportunity: ['0.5x Growth'],
    wellbeing: ['Mental +2', 'Physical +3'],
    body:
      'A quiet, rural town with very low expenses but limited job prospects. Perfect for a simple life, but career growth will be much slower.',
  },
]

export const EDUCATION_TRACK_OPTIONS = [
  {
    id: 'degree-track',
    label: 'Degree Track',
    icon: '🎓',
    debt: ['High student debt.', 'Delayed income.'],
    potential: ['Great. Access to specialized professional'],
    stability: ['High.'],
    body:
      'Formal university education for specialized professions. Significant up-front investment but strong career path.',
  },
  {
    id: 'trades-track',
    label: 'Trades Track',
    icon: '🛠️',
    debt: ['Lower than Degree track. Practical training.'],
    potential: ['Good. In-demand, skilled technical skills.'],
    stability: ['High.'],
    body:
      'Vocational training for high-demand skilled trades. Lower cost and faster entry into a good income.',
  },
  {
    id: 'street-smart',
    label: 'Self-Taught Track',
    icon: '🖥️',
    debt: ['Minimal financial debt.', 'Self-driven learning.'],
    potential: ['Great. Highly variable outcomes.'],
    stability: ['Variable.'],
    body:
      'Rely on self-driven learning and practical experience. Minimal up-front cost, success depends heavily on individual drive and market demand.',
  },
]

export const JOB_OPTIONS = [
  {
    id: 'dental-hygienist',
    label: 'Dental Hygienist',
    icon: '🦷',
    art: WIZARD_ART.jobDental,
    income: '$77,000 / yr',
    stability: 'High',
    wageGrowth: 'Good (further specialization options)',
    careerTrack: 'Degree Track',
  },
  {
    id: 'electrician',
    label: 'Electrician',
    icon: '⚡',
    art: WIZARD_ART.jobElectrician,
    income: '$60,000 / yr',
    stability: 'High',
    wageGrowth: 'High (master electrician license track)',
    careerTrack: 'Trades Track',
  },
  {
    id: 'mechanic',
    label: 'Mechanic',
    icon: '🔧',
    art: WIZARD_ART.jobMechanic,
    income: '$42,000 / yr',
    stability: 'High',
    wageGrowth: 'Good (ASE certification track)',
    careerTrack: 'Street Smart',
  },
]

export const CITY_BY_ID = Object.fromEntries(CITY_OPTIONS.map((option) => [option.id, option]))
export const TRACK_BY_ID = Object.fromEntries(EDUCATION_TRACK_OPTIONS.map((option) => [option.id, option]))
export const JOB_BY_ID = Object.fromEntries(JOB_OPTIONS.map((option) => [option.id, option]))

export const DEFAULT_WIZARD_SELECTIONS = {
  cityId: CITY_OPTIONS[1].id,
  educationTrackId: EDUCATION_TRACK_OPTIONS[1].id,
  jobId: JOB_OPTIONS[1].id,
}
