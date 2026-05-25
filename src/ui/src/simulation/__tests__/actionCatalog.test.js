import { describe, expect, it } from 'vitest'
import { getAvailableTurnActions } from '../actionCatalog'

const player = {
  id: 'player-1',
  name: 'Ari',
  cityId: 'suburbia',
  jobId: 'content-creator',
  educationTrackId: 'self-taught',
  cash: 4000,
  debt: 5000,
  assetsValue: 2600,
  netWorth: 1600,
  monthlyIncome: 4800,
  physicalHealth: 70,
  mentalHealth: 68,
  stress: 44,
  activeIssues: [],
}

describe('action catalog', () => {
  it('offers at most one advanced action per turn', () => {
    const game = { id: 'g1', seed: 'seed-a' }
    for (let turn = 1; turn <= 120; turn += 1) {
      const options = getAvailableTurnActions({ game, player, turnNumber: turn })
      expect(options.advancedActions.length).toBeLessThanOrEqual(1)
    }
  })
})
