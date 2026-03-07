import cityscape from 'openmoji/color/svg/1F3D9.svg'
import mountain from 'openmoji/color/svg/26F0.svg'
import desert from 'openmoji/color/svg/1F3DC.svg'
import moneyBag from 'openmoji/color/svg/1F4B0.svg'
import chartUp from 'openmoji/color/svg/1F4C8.svg'
import heartOrange from 'openmoji/color/svg/1F9E1.svg'
import graduationCap from 'openmoji/color/svg/1F393.svg'
import school from 'openmoji/color/svg/1F3EB.svg'
import wrench from 'openmoji/color/svg/1F527.svg'
import construction from 'openmoji/color/svg/1F6A7.svg'
import laptop from 'openmoji/color/svg/1F4BB.svg'
import books from 'openmoji/color/svg/1F4DA.svg'
import tooth from 'openmoji/color/svg/1F9B7.svg'
import briefcase from 'openmoji/color/svg/1F4BC.svg'
import chartDown from 'openmoji/color/svg/1F4C9.svg'
import { WIZARD_JOB_ART } from '../assets/wizard/art'

export const WIZARD_CITIES = [
  {
    id: 'san-francisco',
    title: 'San Francisco',
    art: cityscape,
    cost: ['Cost of Living Multiplier: 2.5x', 'Tax Rate: 9%'],
    opportunity: ['Opportunity Multiplier: 3x'],
    wellbeing: ['Mental Baseline: +5', 'Physical Baseline: +2'],
    description:
      'A dense urban environment with vibrant culture and tech jobs, but very high living expenses.',
  },
  {
    id: 'denver',
    title: 'Denver',
    art: mountain,
    cost: ['1.2x Cost', '5% Tax'],
    opportunity: ['1.5x Growth'],
    wellbeing: ['Mental +8', 'Physical +9'],
    description:
      'A balanced city with outdoor access, moderate cost, and good opportunity without an extreme tradeoff.',
  },
  {
    id: 'tonopah',
    title: 'Tonopah, NV',
    art: desert,
    cost: ['0.7x Cost', '2% Tax'],
    opportunity: ['0.5x Growth'],
    wellbeing: ['Mental +2', 'Physical +3'],
    description:
      'A quiet rural town with very low expenses but limited job prospects and slower career growth.',
  },
]

export const WIZARD_TRACKS = [
  {
    id: 'degree-track',
    title: 'Degree Track',
    icons: [graduationCap, school],
    debtInvestment: ['High student debt.', 'Delayed income.'],
    longTermPotential: ['Great. Access to specialized professional roles.'],
    stability: ['High.'],
    description:
      'Formal university education for specialized professions. Significant up-front investment but strong career path.',
  },
  {
    id: 'trades-track',
    title: 'Trades Track',
    icons: [wrench, construction],
    debtInvestment: ['Lower than Degree Track.', 'Practical training.'],
    longTermPotential: ['Good. In-demand, skilled technical roles.'],
    stability: ['High.'],
    description:
      'Vocational training for high-demand skilled trades. Lower cost and faster entry into solid income.',
  },
  {
    id: 'self-taught-track',
    title: 'Self-Taught Track',
    icons: [laptop, books],
    debtInvestment: ['Minimal financial debt.', 'Self-driven learning.'],
    longTermPotential: ['Great. Highly variable outcomes.'],
    stability: ['Variable.'],
    description:
      'Rely on self-driven learning and practical experience. Minimal up-front cost, with results tied to effort and demand.',
  },
]

export const WIZARD_JOBS = [
  {
    id: 'dental-hygienist',
    title: 'Dental Hygienist',
    art: WIZARD_JOB_ART.dentalHygienist,
    icon: tooth,
    income: '$77,000 / yr',
    stability: 'High',
    wageGrowth: 'Good (further specialization options)',
    careerTrack: 'Degree Track',
  },
  {
    id: 'electrician',
    title: 'Electrician',
    art: WIZARD_JOB_ART.electrician,
    icon: wrench,
    income: '$60,000 / yr',
    stability: 'High',
    wageGrowth: 'High (master electrician license track)',
    careerTrack: 'Trades Track',
  },
  {
    id: 'mechanic',
    title: 'Mechanic',
    art: WIZARD_JOB_ART.mechanic,
    icon: briefcase,
    income: '$42,000 / yr',
    stability: 'High',
    wageGrowth: 'Good (ASE certification track)',
    careerTrack: 'Self-Taught Track',
  },
]

export const DEFAULT_WIZARD_CITY_ID = WIZARD_CITIES[1].id
export const DEFAULT_WIZARD_TRACK_ID = WIZARD_TRACKS[1].id
export const DEFAULT_WIZARD_JOB_ID = WIZARD_JOBS[1].id

export const getWizardCityById = (cityId) => WIZARD_CITIES.find((city) => city.id === cityId) || WIZARD_CITIES[0]
export const getWizardTrackById = (trackId) =>
  WIZARD_TRACKS.find((track) => track.id === trackId) || WIZARD_TRACKS[0]
export const getWizardJobById = (jobId) => WIZARD_JOBS.find((job) => job.id === jobId) || WIZARD_JOBS[0]

export const WIZARD_STAT_SECTIONS = {
  city: [
    { key: 'cost', label: 'Cost', icon: moneyBag, color: 'green' },
    { key: 'opportunity', label: 'Opportunity', icon: chartUp, color: 'blue' },
    { key: 'wellbeing', label: 'Wellbeing', icon: heartOrange, color: 'purple' },
  ],
  track: [
    { key: 'debtInvestment', label: 'Debt/Investment', icon: moneyBag, color: 'green' },
    { key: 'longTermPotential', label: 'Long-Term Potential', icon: chartUp, color: 'blue' },
    { key: 'stability', label: 'Stability', icon: heartOrange, color: 'purple' },
  ],
  job: [
    { key: 'income', label: 'Income', icon: moneyBag, color: 'gold' },
    { key: 'stability', label: 'Stability', icon: chartUp, color: 'blue' },
    { key: 'wageGrowth', label: 'Wage Growth', icon: chartDown, color: 'orange' },
  ],
}
