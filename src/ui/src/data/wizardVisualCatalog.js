export const WIZARD_TOTAL_STEPS = 6

export const WIZARD_STEP_META = {
  1: { title: 'New Game Setup', subtitle: 'Step 1 of 6' },
  2: { title: 'New Player Setup', subtitle: 'Step 2 of 6' },
  3: { title: 'New Player Setup - Pick City', subtitle: 'Step 3 of 6' },
  4: { title: 'New Player Setup - Education Track', subtitle: 'Step 4 of 6' },
  5: { title: 'New Player Setup - Pick a Career', subtitle: 'Step 5 of 6' },
  6: { title: 'New Game - Summary', subtitle: 'Step 6 of 6' },
}

export const WIZARD_CITY_OPTIONS = [
  {
    id: 'san-francisco',
    name: 'San Francisco, CA',
    blurb: 'High opportunity, high monthly cost, bigger upside swings.',
    costOfLiving: 'Cost of Living: High',
    modifier: 'Opportunity Modifier: +20%',
  },
  {
    id: 'chicago',
    name: 'Chicago, IL',
    blurb: 'Balanced economy with steady jobs and manageable living costs.',
    costOfLiving: 'Cost of Living: Medium',
    modifier: 'Opportunity Modifier: +10%',
  },
  {
    id: 'boise',
    name: 'Boise, ID',
    blurb: 'Lower monthly costs with slower but stable career growth.',
    costOfLiving: 'Cost of Living: Lower',
    modifier: 'Opportunity Modifier: +5%',
  },
]

export const WIZARD_EDUCATION_TRACKS = [
  {
    id: 'degree-track',
    name: 'Degree Track',
    upfront: 'Start Debt: $30,000 student loans',
    weekly: 'Weekly Path: Better long-term salary growth',
    risk: 'Risk: Debt pressure early game',
  },
  {
    id: 'trades-track',
    name: 'Trades Track',
    upfront: 'Start Debt: $5,000 certification cost',
    weekly: 'Weekly Path: Faster income ramp in year one',
    risk: 'Risk: Injury events hit income harder',
  },
  {
    id: 'street-smart-track',
    name: 'Street Smart',
    upfront: 'Start Debt: $0',
    weekly: 'Weekly Path: Flexible jobs with uneven pay',
    risk: 'Risk: Higher income volatility',
  },
]

export const WIZARD_JOB_OPTIONS = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    careerTrack: 'Degree Track',
    income: '$1,550 / week',
    bonus: 'Bonus: +$200 on innovation events',
  },
  {
    id: 'electrician',
    title: 'Electrician',
    careerTrack: 'Trades Track',
    income: '$1,250 / week',
    bonus: 'Bonus: +$150 on contract events',
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    careerTrack: 'Street Smart',
    income: '$900 - $1,900 / week',
    bonus: 'Bonus: Big upside on breakthrough turns',
  },
]
