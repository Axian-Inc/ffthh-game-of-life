export const CITY_OPTIONS = [
  {
    id: 'silicon-city',
    title: 'Silicon City',
    tagline: 'Fast growth, high pressure',
    copy: 'Tech-forward city with premium salaries and premium rent.',
  },
  {
    id: 'sunset-bay',
    title: 'Sunset Bay',
    tagline: 'Creative and coastal',
    copy: 'Balanced pace with steady jobs and high quality of life.',
  },
  {
    id: 'maple-heights',
    title: 'Maple Heights',
    tagline: 'Stable and practical',
    copy: 'Lower costs and predictable opportunities for long-term plans.',
  },
]

export const EDUCATION_TRACK_OPTIONS = [
  {
    id: 'degree-track',
    title: 'Degree Track',
    copy: 'Higher long-term ceiling with student debt at the start.',
  },
  {
    id: 'trades-track',
    title: 'Trades Track',
    copy: 'Skill-first route with faster early earning potential.',
  },
  {
    id: 'creator-track',
    title: 'Creator Track',
    copy: 'Portfolio path with volatility and breakout upside.',
  },
]

export const JOB_OPTIONS = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    careerTrack: 'Degree Track',
    income: '$1,700 / week',
    bonus: 'Skill bonus after milestone turns',
    risk: 'Can pay extra for tools and certifications',
    artKey: 'engineer',
  },
  {
    id: 'electrician',
    title: 'Electrician',
    careerTrack: 'Trades Track',
    income: '$1,450 / week',
    bonus: 'Reliable weekly income with practical demand',
    risk: 'Missed weeks when injury events trigger',
    artKey: 'electrician',
  },
  {
    id: 'content-creator',
    title: 'Content Creator',
    careerTrack: 'Creator Track',
    income: '$900 / week',
    bonus: 'Breakout rolls can add +$1,000',
    risk: 'Dry spells can drop income to $0',
    artKey: 'creator',
  },
]

export const DEFAULT_CITY_ID = CITY_OPTIONS[0].id
export const DEFAULT_EDUCATION_TRACK_ID = EDUCATION_TRACK_OPTIONS[0].id
export const DEFAULT_JOB_ID = JOB_OPTIONS[0].id
