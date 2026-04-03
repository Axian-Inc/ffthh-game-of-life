import { describe, expect, it } from 'vitest'
import { advanceTurnState, createInitialGameState } from '../../utils/turnEngine'

describe('turn engine', () => {
  it('does not produce NaN values when Invest in Bonds resolves an event without physical health delta', () => {
    const game = createInitialGameState({
      name: 'Bonds Repro',
      players: [
        {
          id: 'player-1',
          name: 'Ari',
          avatar: 'fox',
          cityId: 'suburbia',
          educationTrackId: 'self-taught',
          jobId: 'content-creator',
        },
        {
          id: 'player-2',
          name: 'Jo',
          avatar: 'bear',
          cityId: 'metro',
          educationTrackId: 'degree',
          jobId: 'software-engineer',
        },
      ],
    })

    const result = advanceTurnState(game, {
      playerId: 'player-1',
      actionId: 'invest-bonds',
      version: 1,
    })

    const scanForNaN = (value) => {
      if (typeof value === 'number') {
        expect(Number.isNaN(value)).toBe(false)
        return
      }
      if (Array.isArray(value)) {
        value.forEach(scanForNaN)
        return
      }
      if (value && typeof value === 'object') {
        Object.values(value).forEach(scanForNaN)
      }
    }

    scanForNaN(result)
    expect(result.game.players[0].physicalHealth).toBeGreaterThanOrEqual(0)
  })
})
