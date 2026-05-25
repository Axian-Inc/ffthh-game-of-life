export const WIZARD_TOTAL_STEPS = 6
export const WIZARD_PROGRESS_SEGMENTS = 5

export const WIZARD_CITY_OPTIONS = [
  {
    id: 'metro',
    name: 'Metro City',
    shortName: 'Metro',
    icon: '🏙️',
    blurb: 'Fast-paced & high reward',
    modifiers: [
      '$ High cost · 1.5x average',
      '⚡ +1 activity per turn',
      '♡ -1 mental health',
    ],
  },
  {
    id: 'suburbia',
    name: 'Suburbia',
    shortName: 'Suburbia',
    icon: '🏡',
    blurb: 'Balanced & comfortable',
    modifiers: [
      '$ Medium cost · 1x average',
      '⚡ Standard activities',
      '♡ Balanced',
    ],
  },
  {
    id: 'small-town',
    name: 'Small Town',
    shortName: 'Small Town',
    icon: '🌾',
    blurb: 'Quiet & affordable',
    modifiers: [
      '$ Low cost · 0.8x average',
      '⚡ -1 activity per turn',
      '♡ +2 physical health',
    ],
  },
]

export const WIZARD_EDUCATION_TRACKS = [
  {
    id: 'degree',
    name: 'Degree',
    icon: '🎓',
    blurb: 'High ceiling, student debt',
    modifiers: [
      '$ High earnings potential · Significant debt',
      '⚡ More income-related activities',
      '♡ Higher stress initially',
    ],
  },
  {
    id: 'trades',
    name: 'Trades',
    icon: '🔧',
    blurb: 'Steady & hands-on',
    modifiers: [
      '$ Solid earnings · Low debt',
      '⚡ More health-related activities',
      '♡ Strong physical foundation',
    ],
  },
  {
    id: 'self-taught',
    name: 'Self-Taught',
    icon: '💡',
    blurb: 'Wild card, high variance',
    modifiers: [
      '$ Variable earnings · No debt',
      '⚡ Higher variance activity options',
      '♡ Flexible lifestyle',
    ],
  },
]

export const WIZARD_CAREER_OPTIONS = [
  {
    id: 'software-engineer',
    trackId: 'degree',
    title: 'Software Engineer',
    icon: '💻',
    income: '$1,550/wk',
    debt: '$30,000 debt',
    activities: '4 activities/turn',
    shorthand: 'P5 M4 E7',
  },
  {
    id: 'registered-nurse',
    trackId: 'degree',
    title: 'Registered Nurse',
    icon: '🩺',
    income: '$1,420/wk',
    debt: '$24,000 debt',
    activities: '4 activities/turn',
    shorthand: 'P6 M5 E7',
  },
  {
    id: 'financial-analyst',
    trackId: 'degree',
    title: 'Financial Analyst',
    icon: '📈',
    income: '$1,500/wk',
    debt: '$28,000 debt',
    activities: '4 activities/turn',
    shorthand: 'P4 M5 E8',
  },
  {
    id: 'electrician',
    trackId: 'trades',
    title: 'Electrician',
    icon: '🔌',
    income: '$1,250/wk',
    debt: '$5,000 debt',
    activities: '4 activities/turn',
    shorthand: 'P7 M5 E5',
  },
  {
    id: 'hvac-technician',
    trackId: 'trades',
    title: 'HVAC Technician',
    icon: '🛠️',
    income: '$1,180/wk',
    debt: '$4,000 debt',
    activities: '4 activities/turn',
    shorthand: 'P7 M4 E5',
  },
  {
    id: 'plumber',
    trackId: 'trades',
    title: 'Plumber',
    icon: '🚰',
    income: '$1,210/wk',
    debt: '$4,500 debt',
    activities: '4 activities/turn',
    shorthand: 'P6 M5 E5',
  },
  {
    id: 'entrepreneur',
    trackId: 'self-taught',
    title: 'Entrepreneur',
    icon: '🚀',
    income: '$1,400/wk',
    debt: '$2,000 debt',
    activities: '3 activities/turn',
    shorthand: 'P5 M4 E7',
  },
  {
    id: 'musician',
    trackId: 'self-taught',
    title: 'Musician',
    icon: '🎸',
    income: '$1,000/wk',
    debt: '$0 debt',
    activities: '4 activities/turn',
    shorthand: 'P6 M7 E8',
  },
  {
    id: 'content-creator',
    trackId: 'self-taught',
    title: 'Content Creator',
    icon: '📱',
    income: '$1,200/wk',
    debt: '$0 debt',
    activities: '4 activities/turn',
    shorthand: 'P6 M5 E8',
  },
]

export const WIZARD_CITY_BY_ID = Object.fromEntries(WIZARD_CITY_OPTIONS.map((city) => [city.id, city]))
export const WIZARD_TRACK_BY_ID = Object.fromEntries(WIZARD_EDUCATION_TRACKS.map((track) => [track.id, track]))
export const WIZARD_CAREER_BY_ID = Object.fromEntries(WIZARD_CAREER_OPTIONS.map((career) => [career.id, career]))

export const getCareerOptionsForTrack = (trackId) =>
  WIZARD_CAREER_OPTIONS.filter((career) => career.trackId === trackId)
