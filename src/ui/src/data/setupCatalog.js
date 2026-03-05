export const cities = [
  {
    id: 'san-francisco-ca',
    label: 'San Francisco, CA',
    costOfLivingMultiplier: 2.5,
    taxRate: 0.09,
    opportunityMultiplier: 3.0,
    mentalBaseline: 5,
    physicalBaseline: 2,
  },
  {
    id: 'denver-co',
    label: 'Denver, CO',
    costOfLivingMultiplier: 1.2,
    taxRate: 0.05,
    opportunityMultiplier: 1.5,
    mentalBaseline: 8,
    physicalBaseline: 9,
  },
  {
    id: 'tonopah-nv',
    label: 'Tonopah, NV',
    costOfLivingMultiplier: 0.7,
    taxRate: 0.02,
    opportunityMultiplier: 0.5,
    mentalBaseline: 2,
    physicalBaseline: 3,
  },
]

export const educationTracks = [
  {
    id: 'degree-track',
    label: 'Degree Track',
    debtProfile: 'High debt',
    longTermPotential: 'Great',
    stabilityLabel: 'High',
  },
  {
    id: 'trades-track',
    label: 'Trades Track',
    debtProfile: 'Low debt',
    longTermPotential: 'Good',
    stabilityLabel: 'High',
  },
  {
    id: 'self-taught-track',
    label: 'Self-Taught Track',
    debtProfile: 'Minimal debt',
    longTermPotential: 'Variable-high',
    stabilityLabel: 'Variable',
  },
]

export const jobs = [
  {
    id: 'anesthetist',
    trackId: 'degree-track',
    label: 'Anesthetist',
    annualSalary: 210000,
    stability: 'High',
    wageGrowth: 'High',
    startDebt: 160000,
    startingCash: 500,
  },
  {
    id: 'veterinarian',
    trackId: 'degree-track',
    label: 'Veterinarian',
    annualSalary: 115000,
    stability: 'High',
    wageGrowth: 'Medium',
    startDebt: 90000,
    startingCash: 500,
  },
  {
    id: 'doctor',
    trackId: 'degree-track',
    label: 'Doctor',
    annualSalary: 180000,
    stability: 'High',
    wageGrowth: 'High',
    startDebt: 140000,
    startingCash: 500,
  },
  {
    id: 'dental-hygienist',
    trackId: 'trades-track',
    label: 'Dental Hygienist',
    annualSalary: 77000,
    stability: 'High',
    wageGrowth: 'Medium',
    startDebt: 10000,
    startingCash: 500,
  },
  {
    id: 'electrician',
    trackId: 'trades-track',
    label: 'Electrician',
    annualSalary: 60000,
    stability: 'High',
    wageGrowth: 'High',
    startDebt: 8000,
    startingCash: 500,
  },
  {
    id: 'mechanic',
    trackId: 'trades-track',
    label: 'Mechanic',
    annualSalary: 42000,
    stability: 'High',
    wageGrowth: 'Medium',
    startDebt: 6000,
    startingCash: 500,
  },
  {
    id: 'polymarket-trader',
    trackId: 'self-taught-track',
    label: 'Polymarket Trader',
    annualSalary: 68000,
    stability: 'Variable',
    wageGrowth: 'Variable',
    startDebt: 0,
    startingCash: 500,
  },
  {
    id: 'instagram-influencer',
    trackId: 'self-taught-track',
    label: 'Instagram Influencer',
    annualSalary: 52000,
    stability: 'Variable',
    wageGrowth: 'High',
    startDebt: 0,
    startingCash: 500,
  },
  {
    id: 'vibe-coder',
    trackId: 'self-taught-track',
    label: 'Vibe Coder',
    annualSalary: 90000,
    stability: 'Variable',
    wageGrowth: 'High',
    startDebt: 0,
    startingCash: 500,
  },
]

export const getCityById = (cityId) => cities.find((city) => city.id === cityId) || null
export const getEducationTrackById = (trackId) =>
  educationTracks.find((track) => track.id === trackId) || null
export const getJobById = (jobId) => jobs.find((job) => job.id === jobId) || null

const cityTokenById = {
  'san-francisco-ca': 'SF',
  'denver-co': 'DN',
  'tonopah-nv': 'TN',
}

const trackTokenById = {
  'degree-track': 'DEG',
  'trades-track': 'TRD',
  'self-taught-track': 'ST',
}

const jobTokenById = {
  anesthetist: 'AN',
  veterinarian: 'VT',
  doctor: 'DR',
  'dental-hygienist': 'DH',
  electrician: 'EL',
  mechanic: 'MC',
  'polymarket-trader': 'PT',
  'instagram-influencer': 'II',
  'vibe-coder': 'VC',
}

export const setupCatalog = {
  cities: cities.map((city) => ({
    id: city.id,
    name: city.label,
    iconToken: cityTokenById[city.id] || city.label.slice(0, 2).toUpperCase(),
    cost: [
      `Cost Multiplier: x${city.costOfLivingMultiplier.toFixed(1)}`,
      `Tax: ${(city.taxRate * 100).toFixed(1)}%`,
    ],
    opportunity: [`Opportunity Multiplier: x${city.opportunityMultiplier.toFixed(1)}`],
    wellbeing: [
      `Mental Baseline: ${city.mentalBaseline}/10`,
      `Physical Baseline: ${city.physicalBaseline}/10`,
    ],
    description: `${city.label} starting profile.`,
  })),
  educationTracks: educationTracks.map((track) => ({
    id: track.id,
    name: track.label,
    iconToken: trackTokenById[track.id] || 'TRK',
    debtInvestment: track.debtProfile,
    longTermPotential: track.longTermPotential,
    stability: track.stabilityLabel,
    description: `${track.label} progression path.`,
  })),
  jobs: jobs.map((job) => ({
    id: job.id,
    educationTrackId: job.trackId,
    name: job.label,
    salaryAnnual: job.annualSalary,
    stability: job.stability,
    wageGrowth: job.wageGrowth,
    outlook: `${job.label} outlook based on current demand profile.`,
    artToken: jobTokenById[job.id] || 'JB',
  })),
}

export const getSetupItemById = (items, id) => items.find((item) => item.id === id) || null
