import { describe, expect, it } from 'vitest'
import { resolvePlayerTurn } from '../turnResolver'

const createPlayer = () => ({
  id: 'player-1',
  name: 'Ari',
  avatar: 'fox',
  cityId: 'suburbia',
  educationTrackId: 'self-taught',
  jobId: 'content-creator',
  cash: 4000,
  debt: 5000,
  assetsValue: 2500,
  netWorth: 1500,
  monthlyIncome: 4800,
  physicalHealth: 70,
  mentalHealth: 70,
  stress: 30,
  playerTraits: { grit: 0, focus: 0, resilience: 0, riskTolerance: 0 },
  statusEffects: [],
  actionHistory: [],
})

describe('resolvePlayerTurn', () => {
  it('applies deterministic outcomes for same seed and inputs', () => {
    const game = { id: 'game-1', seed: 'seed-123', modifierContext: { difficultyId: 'normal' } }
    const player = createPlayer()

    const first = resolvePlayerTurn({ game, player, actionType: 'pass', turnNumber: 2, playerName: 'Ari' })
    const second = resolvePlayerTurn({ game, player, actionType: 'pass', turnNumber: 2, playerName: 'Ari' })

    expect(first.totalDelta).toEqual(second.totalDelta)
    expect(first.player.netWorth).toEqual(second.player.netWorth)
  })

  it('keeps guaranteed action base effects in turn log', () => {
    const game = { id: 'game-1', seed: 'seed-xyz', modifierContext: { difficultyId: 'normal' } }
    const player = createPlayer()
    const result = resolvePlayerTurn({ game, player, actionType: 'choose_action', turnNumber: 1, playerName: 'Ari' })

    const basePhase = result.turnLog.phaseDeltas.find((entry) => entry.phase === 'action_base')
    expect(basePhase).toBeTruthy()
    expect(basePhase.delta.cash).toBe(-100)
    expect(basePhase.delta.mentalHealth).toBe(1)
  })
})
