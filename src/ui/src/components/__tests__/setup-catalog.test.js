import { describe, expect, it } from 'vitest'
import { cities, educationTrackById, educationTracks, jobById, jobs } from '../../data/setupCatalog'
import { computeStartingState } from '../../utils/startingState'

describe('setup catalog contract', () => {
  it('contains the canonical cities records', () => {
    expect(cities).toEqual([
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

  it('contains the canonical education track records', () => {
    expect(educationTracks).toEqual([
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

  it('contains the canonical job records', () => {
    expect(jobs).toEqual([
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

  it('computes deterministic starting values from city + track + job', () => {
    const vibeCoder = jobById['vibe-coder']
    const selfTaught = educationTrackById['self-taught-track']
    const state = computeStartingState({
      city: cities[0],
      track: selfTaught,
      job: vibeCoder,
    })

    expect(state).toEqual({
      cityId: 'san-francisco-ca',
      trackId: 'self-taught-track',
      jobId: 'vibe-coder',
      cash: 500,
      assets: 0,
      investments: 0,
      debt: 0,
      monthlyIncome: 7500,
      netWorth: 500,
    })
  })

  it('ensures degree-track jobs always have debt and self-taught jobs never do', () => {
    const degreeTrackDebts = jobs
      .filter((job) => job.trackId === 'degree-track')
      .map((job) => job.startDebt)
    const selfTaughtDebts = jobs
      .filter((job) => job.trackId === 'self-taught-track')
      .map((job) => job.startDebt)

    expect(degreeTrackDebts.every((debt) => debt > 0)).toBe(true)
    expect(selfTaughtDebts.every((debt) => debt === 0)).toBe(true)
  })
})
