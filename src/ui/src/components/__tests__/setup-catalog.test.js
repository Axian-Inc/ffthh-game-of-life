import { describe, expect, it } from 'vitest'
import {
  CITY_CATALOG,
  EDUCATION_TRACK_CATALOG,
  JOB_CATALOG,
  SETUP_CATALOG,
  getJobById,
  getJobsByTrackId,
} from '../../data/setupCatalog'
import { createStartingStateFromJob } from '../../utils/startingState'

describe('setup catalog contract', () => {
  it('exports the exact canonical city records', () => {
    expect(CITY_CATALOG).toEqual([
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
    ])
  })

  it('exports the exact canonical education-track records', () => {
    expect(EDUCATION_TRACK_CATALOG).toEqual([
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
    ])
  })

  it('exports the exact canonical job records', () => {
    expect(JOB_CATALOG).toEqual([
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
    ])
  })

  it('keeps the setup catalog free of presentation-only properties', () => {
    expect(SETUP_CATALOG).toEqual({
      cities: CITY_CATALOG,
      educationTracks: EDUCATION_TRACK_CATALOG,
      jobs: JOB_CATALOG,
    })

    const forbiddenKeys = ['iconToken', 'artToken', 'description']

    ;[...CITY_CATALOG, ...EDUCATION_TRACK_CATALOG, ...JOB_CATALOG].forEach((record) => {
      expect(Object.keys(record).sort()).not.toEqual(expect.arrayContaining(forbiddenKeys))
    })
  })

  it('filters jobs by track from the canonical catalog', () => {
    expect(getJobsByTrackId('degree-track').map((job) => job.id)).toEqual([
      'anesthetist',
      'veterinarian',
      'doctor',
    ])
    expect(getJobsByTrackId('trades-track').map((job) => job.id)).toEqual([
      'dental-hygienist',
      'electrician',
      'mechanic',
    ])
    expect(getJobsByTrackId('self-taught-track').map((job) => job.id)).toEqual([
      'polymarket-trader',
      'instagram-influencer',
      'vibe-coder',
    ])
  })

  it('derives deterministic starting values from the selected job', () => {
    expect(createStartingStateFromJob('vibe-coder')).toEqual({
      cash: 500,
      assets: 0,
      investments: 0,
      debt: 0,
      monthlyIncome: 7500,
      netWorth: 500,
    })

    expect(createStartingStateFromJob(getJobById('doctor'))).toEqual({
      cash: 500,
      assets: 0,
      investments: 0,
      debt: 140000,
      monthlyIncome: 15000,
      netWorth: -139500,
    })
  })

  it('preserves the required debt invariants by track', () => {
    expect(getJobsByTrackId('degree-track').every((job) => job.startDebt > 0)).toBe(true)
    expect(getJobsByTrackId('self-taught-track').every((job) => job.startDebt === 0)).toBe(true)
  })
})
