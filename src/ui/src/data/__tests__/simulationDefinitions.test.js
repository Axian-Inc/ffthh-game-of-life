import { describe, expect, it } from 'vitest'
import { CAREER_DEFINITIONS, CITY_DEFINITIONS, EDUCATION_TRACK_DEFINITIONS } from '../simulationDefinitions'
import {
  WIZARD_CAREER_BY_ID,
  WIZARD_CAREER_OPTIONS,
  WIZARD_CITY_BY_ID,
  WIZARD_CITY_OPTIONS,
  WIZARD_TRACK_BY_ID,
  WIZARD_EDUCATION_TRACKS,
  getCareerOptionsForTrack,
} from '../wizardVisualCatalog'

describe('simulation definitions', () => {
  it('keeps canonical city definitions aligned with the wizard catalog', () => {
    expect(WIZARD_CITY_OPTIONS.map((city) => city.id)).toEqual(CITY_DEFINITIONS.map((city) => city.id))

    CITY_DEFINITIONS.forEach((city) => {
      expect(city).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          label: expect.any(String),
          costOfLivingMultiplier: expect.any(Number),
          taxRate: expect.any(Number),
          opportunityMultiplier: expect.any(Number),
          mentalBaseline: expect.any(Number),
          physicalBaseline: expect.any(Number),
          moveCost: expect.any(Number),
        }),
      )
      expect(WIZARD_CITY_BY_ID[city.id]).toEqual(expect.objectContaining({ id: city.id, name: city.label }))
    })
  })

  it('keeps canonical education tracks aligned with the wizard catalog', () => {
    expect(WIZARD_EDUCATION_TRACKS.map((track) => track.id)).toEqual(
      EDUCATION_TRACK_DEFINITIONS.map((track) => track.id),
    )

    EDUCATION_TRACK_DEFINITIONS.forEach((track) => {
      expect(WIZARD_TRACK_BY_ID[track.id]).toEqual(expect.objectContaining({ id: track.id, name: track.label }))
    })
  })

  it('keeps canonical careers aligned with valid tracks and wizard display data', () => {
    const trackIds = new Set(EDUCATION_TRACK_DEFINITIONS.map((track) => track.id))

    expect(WIZARD_CAREER_OPTIONS.map((career) => career.id)).toEqual(CAREER_DEFINITIONS.map((career) => career.id))

    CAREER_DEFINITIONS.forEach((career) => {
      expect(trackIds.has(career.trackId)).toBe(true)
      expect(career).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          label: expect.any(String),
          startCash: expect.any(Number),
          startDebt: expect.any(Number),
          weeklyIncome: expect.any(Number),
          stabilityLevel: expect.any(String),
          riskModifiers: expect.any(Object),
          switchCost: expect.any(Number),
        }),
      )
      expect(WIZARD_CAREER_BY_ID[career.id]).toEqual(
        expect.objectContaining({ id: career.id, title: career.label, trackId: career.trackId }),
      )
    })
  })

  it('filters wizard career options by canonical track id', () => {
    expect(getCareerOptionsForTrack('degree').map((career) => career.id)).toEqual([
      'software-engineer',
      'registered-nurse',
      'financial-analyst',
    ])
    expect(getCareerOptionsForTrack('unknown')).toEqual([])
  })
})
