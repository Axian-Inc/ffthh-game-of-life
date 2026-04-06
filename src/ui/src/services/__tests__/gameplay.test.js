import { describe, expect, it } from 'vitest'
import {
  advanceFromSummary,
  beginGameFromWelcome,
  ensurePlayableGame,
  initializeGameForPlay,
  resolveTurn,
} from '../gameplay'

const createBaseGame = () => ({
  id: 'game-1',
  name: 'Family Game Night',
  status: 'active',
  resumable: true,
  players: [
    {
      id: 'player-1',
      name: 'Ari',
      avatar: 'fox',
      cityId: 'suburbia',
      educationTrackId: 'degree',
      jobId: 'software-engineer',
    },
    {
      id: 'player-2',
      name: 'Jo',
      avatar: 'bear',
      cityId: 'small-town',
      educationTrackId: 'trades',
      jobId: 'electrician',
    },
  ],
})

describe('gameplay service', () => {
  it('initializes deterministic starter state from wizard selections', () => {
    const game = initializeGameForPlay(createBaseGame())

    expect(game.playState).toMatchObject({
      view: 'welcome',
      activePlayerIndex: 0,
      monthIndex: 1,
      turnNumber: 1,
    })
    expect(game.players[0]).toMatchObject({
      monthlyIncome: 6200,
      debt: 30000,
      cash: 7000,
      physicalHealth: 58,
      mentalHealth: 57,
      netWorth: -23000,
    })
    expect(game.players[1]).toMatchObject({
      monthlyIncome: 5000,
      debt: 5000,
      cash: 9000,
      physicalHealth: 61,
      mentalHealth: 59,
      netWorth: 4000,
    })
  })

  it('resolves a turn and rotates to the next player', () => {
    const startedGame = beginGameFromWelcome(initializeGameForPlay(createBaseGame()))
    const resolvedGame = resolveTurn(startedGame, 'job-training')

    expect(resolvedGame.lastTurnSummary).toMatchObject({
      actingPlayerName: 'Ari',
      actionId: 'job-training',
      nextPlayerName: 'Jo',
    })
    expect(resolvedGame.players[0]).toMatchObject({
      cash: 10200,
      debt: 29100,
      monthlyIncome: 6300,
      netWorth: -18900,
      mentalHealth: 55,
      physicalHealth: 58,
    })
    expect(resolvedGame.playState).toMatchObject({
      view: 'summary',
      activePlayerIndex: 1,
      monthIndex: 1,
      turnNumber: 2,
    })
  })

  it('advances from summary back into the next turn without changing rotation', () => {
    const startedGame = beginGameFromWelcome(initializeGameForPlay(createBaseGame()))
    const resolvedGame = resolveTurn(startedGame, 'debt-paydown')
    const advancedGame = advanceFromSummary(resolvedGame)

    expect(advancedGame.playState).toMatchObject({
      view: 'turn',
      activePlayerIndex: 1,
      monthIndex: 1,
      turnNumber: 2,
    })
  })

  it('normalizes older saved games without gameplay fields', () => {
    const legacyGame = {
      id: 'legacy',
      name: 'Legacy Game',
      players: [
        { name: 'Old One', avatar: 'fox' },
        { name: 'Old Two', avatar: 'bear' },
      ],
    }

    const normalizedGame = ensurePlayableGame(legacyGame)

    expect(normalizedGame.playState.view).toBe('welcome')
    expect(normalizedGame.players[0].id).toBe('legacy-player-1')
    expect(normalizedGame.players[0].monthlyIncome).toBeGreaterThan(0)
  })
})
