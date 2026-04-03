import { createGame, createPlayer } from '../../test/testUtils'
import { getActionCatalog, getUpcomingPlayer, initializeGameState, resolveTurn } from '../gameSimulation'

describe('gameSimulation', () => {
  it('initializes playable state from wizard-created players', () => {
    const game = createGame({
      players: [
        createPlayer({
          id: 'player-1',
          name: 'Ari',
          cityId: 'metro',
          educationTrackId: 'degree',
          jobId: 'software-engineer',
        }),
      ],
    })

    const initialized = initializeGameState(game)
    const player = initialized.players[0]

    expect(initialized.activePlayerIndex).toBe(0)
    expect(initialized.turnNumber).toBe(1)
    expect(initialized.phase).toBe('turn-start')
    expect(player.cash).toBeGreaterThan(0)
    expect(player.debt).toBe(30000)
    expect(player.monthlyIncome).toBe(6200)
    expect(player.monthlyExpenses).toBeGreaterThan(2000)
    expect(player.netWorth).toBe(player.cash + player.stocks + player.bonds - player.debt)
  })

  it('resolves turns in the expected phase order', () => {
    const game = initializeGameState(
      createGame({
        randomSeed: 42,
        randomState: 42,
        players: [createPlayer({ jobId: 'content-creator', cityId: 'suburbia' })],
      }),
    )

    const { turnResolution } = resolveTurn(game, { actionId: 'skip-action' })

    expect(turnResolution.phases.map((phase) => phase.id)).toEqual([
      'net-worth',
      'debt',
      'health',
      'event',
      'action',
      'summary',
    ])
  })

  it('supports each core action with expected availability and effects', () => {
    const game = initializeGameState(
      createGame({
        players: [createPlayer({ cityId: 'suburbia', educationTrackId: 'trades', jobId: 'electrician' })],
      }),
    )
    const actionIds = getActionCatalog(game).map((action) => action.id)

    expect(actionIds).toEqual([
      'skip-action',
      'side-gig',
      'debt-paydown',
      'join-gym',
      'spend-time-with-family-friends',
      'invest-in-stocks',
      'relocate-city',
    ])

    const sideGig = resolveTurn(game, { actionId: 'side-gig' })
    expect(sideGig.turnResolution.action.id).toBe('side-gig')

    const debtPaydown = resolveTurn(game, { actionId: 'debt-paydown' })
    expect(debtPaydown.updatedGame.players[0].debt).toBeLessThan(game.players[0].debt)

    const gym = resolveTurn(game, { actionId: 'join-gym' })
    expect(gym.updatedGame.players[0].statusEffects.some((effect) => effect.id === 'gym-membership')).toBe(true)

    const social = resolveTurn(game, { actionId: 'spend-time-with-family-friends' })
    expect(social.updatedGame.players[0].mentalHealth).toBeGreaterThanOrEqual(game.players[0].mentalHealth)

    const stocks = resolveTurn(game, { actionId: 'invest-in-stocks' })
    expect(stocks.updatedGame.players[0].stocks).toBeGreaterThan(game.players[0].stocks)

    const relocate = resolveTurn(game, { actionId: 'relocate-city', targetCityId: 'metro' })
    expect(relocate.updatedGame.players[0].pendingCityId).toBe('metro')
  })

  it('applies relocation on the following turn', () => {
    const baseGame = initializeGameState(
      createGame({
        players: [createPlayer({ cityId: 'suburbia', educationTrackId: 'trades', jobId: 'electrician' })],
      }),
    )

    const relocated = resolveTurn(baseGame, { actionId: 'relocate-city', targetCityId: 'small-town' }).updatedGame
    expect(relocated.players[0].cityId).toBe('suburbia')
    expect(relocated.players[0].pendingCityId).toBe('small-town')

    const nextTurn = resolveTurn(relocated, { actionId: 'skip-action' }).updatedGame
    expect(nextTurn.players[0].cityId).toBe('small-town')
    expect(nextTurn.players[0].pendingCityId).toBeNull()
  })

  it('replays deterministically with the same seed and action sequence', () => {
    const buildGame = () =>
      initializeGameState(
        createGame({
          randomSeed: 99,
          randomState: 99,
          players: [
            createPlayer({ id: 'player-1', jobId: 'content-creator', cityId: 'metro' }),
            createPlayer({ id: 'player-2', name: 'Mia', avatar: 'bear', jobId: 'electrician', cityId: 'small-town' }),
          ],
        }),
      )

    const first = resolveTurn(buildGame(), { actionId: 'side-gig' }).updatedGame
    const second = resolveTurn(buildGame(), { actionId: 'side-gig' }).updatedGame

    expect(first.turnHistory).toEqual(second.turnHistory)
    expect(first.players).toEqual(second.players)
  })

  it('reports the actual next active player after turn rotation', () => {
    const game = initializeGameState(
      createGame({
        players: [
          createPlayer({ id: 'player-1', name: 'Ari' }),
          createPlayer({ id: 'player-2', name: 'Mia', avatar: 'bear' }),
        ],
      }),
    )

    const updated = resolveTurn(game, { actionId: 'skip-action' }).updatedGame
    expect(updated.activePlayerIndex).toBe(1)
    expect(getUpcomingPlayer(updated)?.name).toBe('Mia')
  })

  it('makes unavailable post-phase actions explicit instead of silently skipping', () => {
    const game = initializeGameState(
      createGame({
        players: [
          createPlayer({
            id: 'player-1',
            name: 'Ari',
            cash: 1000,
            debt: 0,
            monthlyIncome: 0,
            monthlyExpenses: 2500,
            physicalHealth: 60,
            mentalHealth: 60,
            stocks: 0,
            bonds: 0,
          }),
        ],
        randomSeed: 1,
        randomState: 1,
      }),
    )

    const { turnResolution } = resolveTurn(game, { actionId: 'invest-in-stocks' })

    expect(turnResolution.action.id).toBe('skip-action')
    expect(turnResolution.action.label).toBe('Invest in stocks')
    expect(turnResolution.action.unintended.join(' ')).toMatch(/at least \$250 cash/i)
  })

  it('rejects invalid relocation targets instead of charging for a no-op move', () => {
    const game = initializeGameState(
      createGame({
        players: [createPlayer({ cityId: 'suburbia', jobId: 'electrician' })],
      }),
    )

    const { updatedGame, turnResolution } = resolveTurn(game, {
      actionId: 'relocate-city',
      targetCityId: 'invalid-city',
    })

    expect(turnResolution.action.label).toBe('Relocate city')
    expect(turnResolution.action.unintended.join(' ')).toMatch(/valid destination city/i)
    expect(updatedGame.players[0].pendingCityId).toBeNull()
  })
})
