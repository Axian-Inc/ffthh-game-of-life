import { wizardArt } from '../assets/wizard/art'

export const wizardPersonas = [
  { id: 'rocket', label: 'Rocket persona', asset: wizardArt.personas.rocket },
  { id: 'robot', label: 'Robot persona', asset: wizardArt.personas.robot },
  { id: 'cat', label: 'Cat persona', asset: wizardArt.personas.cat },
  { id: 'octopus', label: 'Octopus persona', asset: wizardArt.personas.octopus },
  { id: 'books', label: 'Book stack persona', asset: wizardArt.personas.books },
  { id: 'star', label: 'Star persona', asset: wizardArt.personas.star },
  { id: 'saturn', label: 'Saturn persona', asset: wizardArt.personas.saturn },
  { id: 'rocket-small', label: 'Rocket trail persona', asset: wizardArt.personas.rocketSmall },
  { id: 'tree', label: 'Tree persona', asset: wizardArt.personas.tree },
  { id: 'journal', label: 'Journal persona', asset: wizardArt.personas.journal },
  { id: 'spider', label: 'Spider persona', asset: wizardArt.personas.spider },
  { id: 'sun', label: 'Sun persona', asset: wizardArt.personas.sun },
  { id: 'tree-round', label: 'Round tree persona', asset: wizardArt.personas.treeRound },
  { id: 'open-book', label: 'Open book persona', asset: wizardArt.personas.openBook },
  { id: 'car', label: 'Car persona', asset: wizardArt.personas.car },
  { id: 'crab', label: 'Crab persona', asset: wizardArt.personas.crab },
  { id: 'snake', label: 'Snake persona', asset: wizardArt.personas.snake },
  { id: 'turtle', label: 'Turtle persona', asset: wizardArt.personas.turtle },
  { id: 'alien', label: 'Alien persona', asset: wizardArt.personas.alien },
  { id: 'monster', label: 'Monster persona', asset: wizardArt.personas.monster },
  { id: 'robot-two', label: 'Companion robot persona', asset: wizardArt.personas.robot2 },
  { id: 'brain', label: 'Brain persona', asset: wizardArt.personas.brain },
  { id: 'rocket-two', label: 'Launch persona', asset: wizardArt.personas.rocket2 },
  { id: 'laptop', label: 'Laptop learner persona', asset: wizardArt.personas.laptop },
  { id: 'machine', label: 'Machine persona', asset: wizardArt.personas.machine },
]

export const wizardCities = {
  'san-francisco': {
    id: 'san-francisco',
    title: 'San Francisco',
    lines: [
      { section: 'Cost', text: 'Cost of Living Multiplier: 2.5x', icon: '$' },
      { section: 'Cost', text: 'Tax Rate: 9%', icon: '%' },
      { section: 'Opportunity', text: 'Opportunity Multiplier: 3x', icon: '+' },
      { section: 'Wellbeing', text: 'Mental Baseline: +5', icon: 'M' },
      { section: 'Wellbeing', text: 'Physical Baseline: +2', icon: 'P' },
    ],
    description:
      'A dense urban environment with vibrant culture and tech jobs, but very high living expenses. Remember, there is no free lunch. High reward comes with high cost.',
    asset: wizardArt.cities.sanFrancisco,
  },
  denver: {
    id: 'denver',
    title: 'Denver',
    lines: [
      { section: 'Cost', text: '1.2x Col', icon: '$' },
      { section: 'Cost', text: '5% Tax', icon: '%' },
      { section: 'Opportunity', text: '1.5x Growth', icon: '+' },
      { section: 'Wellbeing', text: 'Mental +8', icon: 'M' },
      { section: 'Wellbeing', text: 'Physical +9', icon: 'P' },
    ],
    description:
      'A balanced city with outdoor access. Moderate CoL and good opportunity - a comfortable middle, but not an extreme. The tradeoff is less focus on any single area.',
    asset: wizardArt.cities.denver,
  },
  tonopah: {
    id: 'tonopah',
    title: 'Tonopah, NV',
    lines: [
      { section: 'Cost', text: '0.7x Col', icon: '$' },
      { section: 'Cost', text: '2% Tax', icon: '%' },
      { section: 'Opportunity', text: '0.5x Growth', icon: '+' },
      { section: 'Wellbeing', text: 'Mental +2', icon: 'M' },
      { section: 'Wellbeing', text: 'Physical +3', icon: 'P' },
    ],
    description:
      'A quiet, rural town with very low expenses but limited job prospects. Perfect for a simple life, but career growth will be much slower.',
    asset: wizardArt.cities.tonopah,
  },
}

export const wizardTracks = {
  'degree-track': {
    id: 'degree-track',
    title: 'Degree Track',
    bars: [
      { section: 'Debt/Investment', text: 'High student debt.', icon: '$' },
      { section: 'Debt/Investment', text: 'Delayed income.', icon: 'T' },
      { section: 'Long-Term Potential', text: 'Great. Access to specialized professional careers.', icon: '+' },
      { section: 'Stability', text: 'High.', icon: 'S' },
    ],
    description:
      'Formal university education for specialized professions. Significant up-front investment but strong career path.',
    asset: wizardArt.tracks.degree,
  },
  'trades-track': {
    id: 'trades-track',
    title: 'Trades Track',
    bars: [
      { section: 'Debt/Investment', text: 'Lower than Degree track.', icon: '$' },
      { section: 'Debt/Investment', text: 'Practical training.', icon: 'T' },
      { section: 'Long-Term Potential', text: 'Good. In-demand, skilled technical skills.', icon: '+' },
      { section: 'Stability', text: 'High.', icon: 'S' },
    ],
    description:
      'Vocational training for high-demand skilled trades. Lower cost and faster entry into a good income.',
    asset: wizardArt.tracks.trades,
  },
  'self-taught-track': {
    id: 'self-taught-track',
    title: 'Self-Taught Track',
    bars: [
      { section: 'Debt/Investment', text: 'Minimal financial debt.', icon: '$' },
      { section: 'Debt/Investment', text: 'Self-driven learning.', icon: 'T' },
      { section: 'Long-Term Potential', text: 'Great. Highly variable outcomes.', icon: '+' },
      { section: 'Stability', text: 'Variable.', icon: 'S' },
    ],
    description:
      'Rely on self-driven learning and practical experience. Minimal up-front cost, success depends heavily on individual drive and market demand.',
    asset: wizardArt.tracks.selfTaught,
  },
}

export const wizardJobs = {
  'dental-hygienist': {
    id: 'dental-hygienist',
    educationTrackId: 'trades-track',
    title: 'Dental Hygienist',
    outlook: 'Good (further specialization options)',
    stats: [
      { section: 'Income', text: '$77,000 / yr' },
      { section: 'Stability', text: 'High' },
      { section: 'Wage Growth', text: 'Good (further specialization options)' },
    ],
    asset: wizardArt.jobs.dentalHygienist,
  },
  electrician: {
    id: 'electrician',
    educationTrackId: 'trades-track',
    title: 'Electrician',
    outlook: 'High (master electrician license track)',
    stats: [
      { section: 'Income', text: '$60,000 / yr' },
      { section: 'Stability', text: 'High' },
      { section: 'Wage Growth', text: 'High (master electrician license track)' },
    ],
    asset: wizardArt.jobs.electrician,
  },
  mechanic: {
    id: 'mechanic',
    educationTrackId: 'trades-track',
    title: 'Mechanic',
    outlook: 'Good (ASE certification track)',
    stats: [
      { section: 'Income', text: '$42,000 / yr' },
      { section: 'Stability', text: 'High' },
      { section: 'Wage Growth', text: 'Good (ASE certification track)' },
    ],
    asset: wizardArt.jobs.mechanic,
  },
  veterinarian: {
    id: 'veterinarian',
    educationTrackId: 'degree-track',
    title: 'Veterinarian',
    outlook: 'High demand in community clinics and family practices',
    stats: [
      { section: 'Income', text: '$95,000 / yr' },
      { section: 'Stability', text: 'High' },
      { section: 'Wage Growth', text: 'Good (specialty certification track)' },
    ],
    asset: wizardArt.jobs.veterinarian,
  },
  'software-developer': {
    id: 'software-developer',
    educationTrackId: 'degree-track',
    title: 'Software Developer',
    outlook: 'Strong in growth sectors with portfolio depth',
    stats: [
      { section: 'Income', text: '$88,000 / yr' },
      { section: 'Stability', text: 'Good' },
      { section: 'Wage Growth', text: 'High (senior engineer track)' },
    ],
    asset: wizardArt.jobs.electrician,
  },
  teacher: {
    id: 'teacher',
    educationTrackId: 'degree-track',
    title: 'Teacher',
    outlook: 'Steady demand with district and subject specialization',
    stats: [
      { section: 'Income', text: '$52,000 / yr' },
      { section: 'Stability', text: 'High' },
      { section: 'Wage Growth', text: 'Good (credential ladder)' },
    ],
    asset: wizardArt.jobs.dentalHygienist,
  },
  designer: {
    id: 'designer',
    educationTrackId: 'self-taught-track',
    title: 'Designer',
    outlook: 'Portfolio quality strongly shapes freelance and studio work',
    stats: [
      { section: 'Income', text: '$54,000 / yr' },
      { section: 'Stability', text: 'Variable' },
      { section: 'Wage Growth', text: 'Good (brand and product specialization)' },
    ],
    asset: wizardArt.jobs.mechanic,
  },
  'content-creator': {
    id: 'content-creator',
    educationTrackId: 'self-taught-track',
    title: 'Content Creator',
    outlook: 'High upside with uneven monthly demand',
    stats: [
      { section: 'Income', text: '$40,000 / yr' },
      { section: 'Stability', text: 'Variable' },
      { section: 'Wage Growth', text: 'Great (audience compounding)' },
    ],
    asset: wizardArt.jobs.electrician,
  },
  founder: {
    id: 'founder',
    educationTrackId: 'self-taught-track',
    title: 'Founder',
    outlook: 'Highly variable with strong reward for persistence and fit',
    stats: [
      { section: 'Income', text: '$48,000 / yr' },
      { section: 'Stability', text: 'Variable' },
      { section: 'Wage Growth', text: 'Great (equity upside)' },
    ],
    asset: wizardArt.jobs.veterinarian,
  },
}

export const wizardSummaryFixture = [
  {
    id: 'fixture-jack',
    name: 'Jack',
    avatar: { src: wizardArt.personas.robot, label: 'Robot persona' },
    cityId: 'denver',
    cityLabel: 'Denver, CO',
    cityAsset: wizardArt.cities.denver,
    educationTrackId: 'trades-track',
    educationLabel: 'Trades',
    educationAsset: wizardArt.tracks.trades,
    jobId: 'electrician',
    jobLabel: 'Electrician',
    jobAsset: wizardArt.jobs.electrician,
  },
  {
    id: 'fixture-mia',
    name: 'Mia',
    avatar: { src: wizardArt.personas.cat, label: 'Cat persona' },
    cityId: 'portland',
    cityLabel: 'Portland, OR',
    cityAsset: wizardArt.cities.portland,
    educationTrackId: 'trades-track',
    educationLabel: 'Trades',
    educationAsset: wizardArt.tracks.trades,
    jobId: 'dental-hygienist',
    jobLabel: 'Dental Hygienist',
    jobAsset: wizardArt.jobs.dentalHygienist,
  },
  {
    id: 'fixture-mike',
    name: 'Mike',
    avatar: { src: wizardArt.personas.rocketSmall, label: 'Rocket trail persona' },
    cityId: 'tonopah',
    cityLabel: 'Tonopah, NV',
    cityAsset: wizardArt.cities.tonopah,
    educationTrackId: 'degree-track',
    educationLabel: 'Degree',
    educationAsset: wizardArt.tracks.degree,
    jobId: 'veterinarian',
    jobLabel: 'Veterinarian',
    jobAsset: wizardArt.jobs.veterinarian,
  },
]

export const wizardSectionStyles = {
  Cost: { className: 'wizard-bar-cost', iconClassName: 'wizard-pill-cost' },
  Opportunity: { className: 'wizard-bar-opportunity', iconClassName: 'wizard-pill-opportunity' },
  Wellbeing: { className: 'wizard-bar-wellbeing', iconClassName: 'wizard-pill-wellbeing' },
  'Debt/Investment': { className: 'wizard-bar-cost', iconClassName: 'wizard-pill-cost' },
  'Long-Term Potential': { className: 'wizard-bar-opportunity', iconClassName: 'wizard-pill-opportunity' },
  Stability: { className: 'wizard-bar-wellbeing', iconClassName: 'wizard-pill-wellbeing' },
  Income: { className: 'wizard-bar-income', iconClassName: 'wizard-pill-income' },
  'Wage Growth': { className: 'wizard-bar-growth', iconClassName: 'wizard-pill-growth' },
}

export const getWizardPersona = (personaId) =>
  wizardPersonas.find((persona) => persona.id === personaId) || wizardPersonas[0]

export const getWizardCity = (cityId) => wizardCities[cityId] || wizardCities.denver

export const getWizardTrack = (trackId) => wizardTracks[trackId] || wizardTracks['trades-track']

export const getWizardJob = (jobId) => wizardJobs[jobId] || wizardJobs.electrician

export const getWizardJobsForTrack = (trackId) =>
  Object.values(wizardJobs).filter((job) => job.educationTrackId === trackId)
