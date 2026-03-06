import { cityArt, educationArt, jobArt } from '../assets/wizard/art'

export const MAX_PLAYERS = 6
export const MIN_PLAYERS = 2

export const CITY_OPTIONS = [
  {
    id: 'san-francisco',
    title: 'San Francisco',
    artSrc: cityArt.sanFrancisco,
    sections: [
      {
        title: 'Cost',
        tone: 'green',
        items: ['Cost of Living Multiplier: 2.5x', 'Tax Rate: 9%'],
      },
      {
        title: 'Opportunity',
        tone: 'blue',
        items: ['Opportunity Multiplier: 3x'],
      },
      {
        title: 'Wellbeing',
        tone: 'purple',
        items: ['Mental Baseline: +5', 'Physical Baseline: +2'],
      },
    ],
    description:
      'A dense urban environment with vibrant culture and tech jobs, but very high living expenses. Remember, there is no free lunch, high reward comes with high cost.',
  },
  {
    id: 'denver',
    title: 'Denver',
    artSrc: cityArt.denver,
    sections: [
      {
        title: 'Cost',
        tone: 'green',
        items: ['1.2x CoL', '5% Tax'],
      },
      {
        title: 'Opportunity',
        tone: 'blue',
        items: ['1.5x Growth'],
      },
      {
        title: 'Wellbeing',
        tone: 'purple',
        items: ['Mental +8', 'Physical +9'],
      },
    ],
    description:
      'A balanced city with outdoor access. Moderate CoL and good opportunity, comfortable middle, but not an extreme. The tradeoff is less focus on any single area.',
  },
  {
    id: 'tonopah',
    title: 'Tonopah, NV',
    artSrc: cityArt.tonopah,
    sections: [
      {
        title: 'Cost',
        tone: 'green',
        items: ['0.7x CoL', '2% Tax'],
      },
      {
        title: 'Opportunity',
        tone: 'blue',
        items: ['0.5x Growth'],
      },
      {
        title: 'Wellbeing',
        tone: 'purple',
        items: ['Mental +2', 'Physical +3'],
      },
    ],
    description:
      'A quiet, rural town with very low expenses but limited job prospects. Perfect for a simple life, but career growth will be much slower.',
  },
]

export const EDUCATION_TRACK_OPTIONS = [
  {
    id: 'degree-track',
    title: 'Degree Track',
    artSrc: educationArt.degreeTrack,
    sections: [
      {
        title: 'Debt/Investment',
        tone: 'green',
        items: ['High student debt.', 'Delayed income.'],
      },
      {
        title: 'Long-Term Potential',
        tone: 'blue',
        items: ['Great. Access to specialized professional roles.'],
      },
      {
        title: 'Stability',
        tone: 'purple',
        items: ['High.'],
      },
    ],
    description:
      'Formal university education for specialized professions. Significant up-front investment but strong career path.',
  },
  {
    id: 'trades-track',
    title: 'Trades Track',
    artSrc: educationArt.tradesTrack,
    sections: [
      {
        title: 'Debt/Investment',
        tone: 'green',
        items: ['Lower than Degree track.', 'Practical training.'],
      },
      {
        title: 'Long-Term Potential',
        tone: 'blue',
        items: ['Good. In-demand, skilled technical skills.'],
      },
      {
        title: 'Stability',
        tone: 'purple',
        items: ['High.'],
      },
    ],
    description:
      'Vocational training for high-demand skilled trades. Lower cost and faster entry into a good income.',
  },
  {
    id: 'self-taught-track',
    title: 'Self-Taught Track',
    artSrc: educationArt.selfTaughtTrack,
    sections: [
      {
        title: 'Debt/Investment',
        tone: 'green',
        items: ['Minimal financial debt.', 'Self-driven learning.'],
      },
      {
        title: 'Long-Term Potential',
        tone: 'blue',
        items: ['Great. Highly variable outcomes.'],
      },
      {
        title: 'Stability',
        tone: 'purple',
        items: ['Variable.'],
      },
    ],
    description:
      'Rely on self-driven learning and practical experience. Minimal up-front cost, success depends heavily on individual drive and market demand.',
  },
]

export const JOB_OPTIONS_BY_TRACK = {
  'degree-track': [
    {
      id: 'dental-hygienist',
      title: 'Dental Hygienist',
      artSrc: jobArt.dentalHygienist,
      income: '$77,000 / yr',
      stability: 'High',
      wageGrowth: 'Good (further specialization options)',
    },
    {
      id: 'veterinarian',
      title: 'Veterinarian',
      artSrc: jobArt.veterinarian,
      income: '$92,000 / yr',
      stability: 'High',
      wageGrowth: 'High (specialist clinic path)',
    },
    {
      id: 'paramedic',
      title: 'Paramedic',
      artSrc: jobArt.paramedic,
      income: '$58,000 / yr',
      stability: 'Medium',
      wageGrowth: 'Good (supervisor certification track)',
    },
  ],
  'trades-track': [
    {
      id: 'dental-hygienist',
      title: 'Dental Hygienist',
      artSrc: jobArt.dentalHygienist,
      income: '$77,000 / yr',
      stability: 'High',
      wageGrowth: 'Good (further specialization options)',
    },
    {
      id: 'electrician',
      title: 'Electrician',
      artSrc: jobArt.electrician,
      income: '$60,000 / yr',
      stability: 'High',
      wageGrowth: 'High (master electrician license track)',
    },
    {
      id: 'mechanic',
      title: 'Mechanic',
      artSrc: jobArt.mechanic,
      income: '$42,000 / yr',
      stability: 'High',
      wageGrowth: 'Good (ASE certification track)',
    },
  ],
  'self-taught-track': [
    {
      id: 'software-developer',
      title: 'Software Developer',
      artSrc: jobArt.softwareDeveloper,
      income: '$68,000 / yr',
      stability: 'Variable',
      wageGrowth: 'High (portfolio-driven upside)',
    },
    {
      id: 'entrepreneur',
      title: 'Entrepreneur',
      artSrc: jobArt.entrepreneur,
      income: '$35,000 / yr',
      stability: 'Variable',
      wageGrowth: 'Very High (if the business scales)',
    },
    {
      id: 'electrician',
      title: 'Electrician',
      artSrc: jobArt.electrician,
      income: '$60,000 / yr',
      stability: 'High',
      wageGrowth: 'High (apprenticeship crossover path)',
    },
  ],
}

export const WIZARD_VISUAL_SCENARIO = {
  gameName: 'Choices Matter',
  players: [
    {
      name: 'Jack',
      avatar: 'robot',
      cityId: 'denver',
      educationTrackId: 'trades-track',
      jobId: 'electrician',
    },
    {
      name: 'Mia',
      avatar: 'cat',
      cityId: 'san-francisco',
      educationTrackId: 'degree-track',
      jobId: 'dental-hygienist',
    },
    {
      name: 'Mike',
      avatar: 'rocket',
      cityId: 'tonopah',
      educationTrackId: 'degree-track',
      jobId: 'veterinarian',
    },
  ],
}

export const getCityById = (cityId) => CITY_OPTIONS.find((city) => city.id === cityId) || null

export const getEducationTrackById = (trackId) =>
  EDUCATION_TRACK_OPTIONS.find((track) => track.id === trackId) || null

export const getJobsForTrack = (trackId) => JOB_OPTIONS_BY_TRACK[trackId] || []

export const getJobById = (trackId, jobId) =>
  getJobsForTrack(trackId).find((job) => job.id === jobId) || null
