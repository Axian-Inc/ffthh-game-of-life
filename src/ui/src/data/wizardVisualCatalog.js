import { CAREER_DEFINITIONS, CITY_DEFINITIONS, EDUCATION_TRACK_DEFINITIONS } from './simulationDefinitions'

export const WIZARD_TOTAL_STEPS = 6
export const WIZARD_PROGRESS_SEGMENTS = 5

const formatMoney = (value) => `$${value.toLocaleString()}`

export const WIZARD_CITY_OPTIONS = CITY_DEFINITIONS.map((city) => ({
  ...city,
  name: city.label,
}))

export const WIZARD_EDUCATION_TRACKS = EDUCATION_TRACK_DEFINITIONS.map((track) => ({
  ...track,
  name: track.label,
}))

export const WIZARD_CAREER_OPTIONS = CAREER_DEFINITIONS.map((career) => ({
  ...career,
  title: career.label,
  income: `${formatMoney(career.weeklyIncome)}/wk`,
  debt: career.startDebt > 0 ? `${formatMoney(career.startDebt)} debt` : '$0 debt',
  activities: `${career.activitiesPerTurn} activities/turn`,
}))

export const WIZARD_CITY_BY_ID = Object.fromEntries(WIZARD_CITY_OPTIONS.map((city) => [city.id, city]))
export const WIZARD_TRACK_BY_ID = Object.fromEntries(WIZARD_EDUCATION_TRACKS.map((track) => [track.id, track]))
export const WIZARD_CAREER_BY_ID = Object.fromEntries(WIZARD_CAREER_OPTIONS.map((career) => [career.id, career]))

export const getCareerOptionsForTrack = (trackId) =>
  WIZARD_CAREER_OPTIONS.filter((career) => career.trackId === trackId)
