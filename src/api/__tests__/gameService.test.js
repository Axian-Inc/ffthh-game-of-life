const {
  createGame,
  updateGame,
  deleteGame,
  listGamesByUser,
} = require('../services/gameService')
const {
  validateCreatePayload,
  validateUpdatePayload,
} = require('../services/gameValidation')

const buildRepo = (overrides = {}) => ({
  createGame: jest.fn(),
  updateGame: jest.fn(),
  deleteGame: jest.fn(),
  getGameById: jest.fn(),
  listGamesByUser: jest.fn(),
  ...overrides,
})

const buildPlayer = (name) => ({ name })

describe('gameService', () => {
  test('creates a game with defaults and generated id', async () => {
    const repo = buildRepo({
      createGame: jest.fn((userId, game) => ({ ...game, userId })),
    })
    const now = () => 1700000000000
    const uuid = () => 'game-123'

    const game = await createGame({
      payload: { name: '  New Game ', players: [buildPlayer('Alex')] },
      userId: 'user-1',
      repo,
      now,
      uuid,
    })

    expect(game).toEqual({
      id: 'game-123',
      name: 'New Game',
      status: 'new',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      players: [buildPlayer('Alex')],
      currentTurnState: {},
      metadata: {},
      version: 1,
    })
  })

  test('validates create payload', async () => {
    const repo = buildRepo()

    await expect(
      createGame({ payload: { players: [] }, userId: 'user-1', repo }),
    ).rejects.toMatchObject({
      type: 'validation',
      details: expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'players' }),
      ]), 
    })
  })

  test('rejects create when payload is missing', async () => {
    const repo = buildRepo()

    await expect(createGame({ payload: null, userId: 'user-1', repo })).rejects.toMatchObject({
      type: 'validation',
    })
  })

  test('retries create when id collides', async () => {
    const repo = buildRepo({
      createGame: jest
        .fn()
        .mockReturnValueOnce(null)
        .mockImplementationOnce((userId, game) => ({ ...game, userId })),
    })
    const uuids = ['id-1', 'id-2']
    const uuid = () => uuids.shift()

    const game = await createGame({
      payload: { name: 'New Game', players: [buildPlayer('Alex')] },
      userId: 'user-1',
      repo,
      uuid,
    })

    expect(game.id).toBe('id-2')
    expect(repo.createGame).toHaveBeenCalledTimes(2)
  })

  test('fails create after repeated collisions', async () => {
    const repo = buildRepo({
      createGame: jest.fn(() => null),
    })

    await expect(
      createGame({ payload: { name: 'Game', players: [buildPlayer('Alex')] }, userId: 'user-1', repo }),
    ).rejects.toMatchObject({ type: 'server' })
  })

  test('updates a game and increments version', async () => {
    const repo = buildRepo({
      getGameById: jest.fn(() => ({ id: 'game-1', userId: 'user-1', version: 2 })),
      updateGame: jest.fn((userId, game) => ({ ...game, userId })),
    })
    const now = () => 1700000009999

    const game = await updateGame({
      gameId: 'game-1',
      payload: {
        id: 'game-1',
        name: 'Updated',
        status: 'active',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
        players: [buildPlayer('Alex')],
        currentTurnState: { turn: 2, careerSelections: { Alex: 'college' } },
        metadata: {},
        version: 2,
      },
      userId: 'user-1',
      repo,
      now,
    })

    expect(game).toEqual({
      id: 'game-1',
      name: 'Updated',
      status: 'active',
      createdAt: 1700000000000,
      updatedAt: 1700000009999,
      players: [buildPlayer('Alex')],
      currentTurnState: { turn: 2, careerSelections: { Alex: 'college' } },
      metadata: {},
      version: 3,
    })
  })

  test('rejects update when version conflicts', async () => {
    const repo = buildRepo({
      getGameById: jest.fn(() => ({ id: 'game-1', userId: 'user-1', version: 2 })),
    })

    await expect(
      updateGame({
        gameId: 'game-1',
      payload: {
        id: 'game-1',
        name: 'Updated',
        status: 'active',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
        players: [buildPlayer('Alex')],
        currentTurnState: { careerSelections: { Alex: 'college' } },
        metadata: {},
        version: 1,
      },
        userId: 'user-1',
        repo,
      }),
    ).rejects.toMatchObject({ type: 'conflict' })
  })

  test('rejects update when game is missing', async () => {
    const repo = buildRepo({
      getGameById: jest.fn(() => null),
    })

    await expect(
      updateGame({
        gameId: 'game-1',
      payload: {
        id: 'game-1',
        name: 'Updated',
        status: 'active',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
        players: [buildPlayer('Alex')],
        currentTurnState: { careerSelections: { Alex: 'college' } },
        metadata: {},
        version: 1,
      },
        userId: 'user-1',
        repo,
      }),
    ).rejects.toMatchObject({ type: 'notFound' })
  })

  test('rejects update when id mismatches', async () => {
    const repo = buildRepo()

    await expect(
      updateGame({
        gameId: 'game-2',
        payload: {
          id: 'game-1',
          name: 'Updated',
          status: 'active',
          createdAt: 1700000000000,
          updatedAt: 1700000000000,
          players: [buildPlayer('Alex')],
          currentTurnState: { careerSelections: { Alex: 'college' } },
          metadata: {},
          version: 1,
        },
        userId: 'user-1',
        repo,
      }),
    ).rejects.toMatchObject({ type: 'validation' })
  })

  test('rejects update when career selections are missing', async () => {
    const repo = buildRepo({
      getGameById: jest.fn(() => ({ id: 'game-1', userId: 'user-1', version: 1 })),
    })

    await expect(
      updateGame({
        gameId: 'game-1',
        payload: {
          id: 'game-1',
          name: 'Updated',
          status: 'active',
          createdAt: 1700000000000,
          updatedAt: 1700000000000,
          players: [buildPlayer('Alex')],
          currentTurnState: {},
          metadata: {},
          version: 1,
        },
        userId: 'user-1',
        repo,
      }),
    ).rejects.toMatchObject({ type: 'validation' })
  })

  test('rejects update when restricted roles are duplicated', async () => {
    const repo = buildRepo({
      getGameById: jest.fn(() => ({ id: 'game-1', userId: 'user-1', version: 1 })),
    })

    await expect(
      updateGame({
        gameId: 'game-1',
        payload: {
          id: 'game-1',
          name: 'Updated',
          status: 'active',
          createdAt: 1700000000000,
          updatedAt: 1700000000000,
          players: [buildPlayer('Alex'), buildPlayer('Sam')],
          currentTurnState: { careerSelections: { Alex: 'college', Sam: 'college' } },
          metadata: { restrictedRoles: ['college'] },
          version: 1,
        },
        userId: 'user-1',
        repo,
      }),
    ).rejects.toMatchObject({ type: 'validation' })
  })

  test('rejects update when user is unauthorized', async () => {
    const repo = buildRepo({
      getGameById: jest.fn(() => ({ id: 'game-1', userId: 'other', version: 1 })),
    })

    await expect(
      updateGame({
        gameId: 'game-1',
        payload: {
          id: 'game-1',
          name: 'Updated',
          status: 'active',
          createdAt: 1700000000000,
          updatedAt: 1700000000000,
          players: [buildPlayer('Alex')],
          currentTurnState: { careerSelections: { Alex: 'college' } },
          metadata: {},
          version: 1,
        },
        userId: 'user-1',
        repo,
      }),
    ).rejects.toMatchObject({ type: 'forbidden' })
  })

  test('handles repository conflict during update', async () => {
    const repo = buildRepo({
      getGameById: jest.fn(() => ({ id: 'game-1', userId: 'user-1', version: 1 })),
      updateGame: jest.fn(() => null),
    })

    await expect(
      updateGame({
        gameId: 'game-1',
        payload: {
          id: 'game-1',
          name: 'Updated',
          status: 'active',
          createdAt: 1700000000000,
          updatedAt: 1700000000000,
          players: [buildPlayer('Alex')],
          currentTurnState: { careerSelections: { Alex: 'college' } },
          metadata: {},
          version: 1,
        },
        userId: 'user-1',
        repo,
      }),
    ).rejects.toMatchObject({ type: 'conflict' })
  })

  test('deletes a game with ownership check', async () => {
    const repo = buildRepo({
      getGameById: jest.fn(() => ({ id: 'game-1', userId: 'user-1', version: 1 })),
      deleteGame: jest.fn(() => true),
    })

    await expect(deleteGame({ gameId: 'game-1', userId: 'user-1', repo })).resolves.toBeUndefined()
  })

  test('rejects delete when game is missing', async () => {
    const repo = buildRepo({
      getGameById: jest.fn(() => null),
    })

    await expect(deleteGame({ gameId: 'game-1', userId: 'user-1', repo })).rejects.toMatchObject({
      type: 'notFound',
    })
  })

  test('rejects delete when repository reports missing', async () => {
    const repo = buildRepo({
      getGameById: jest.fn(() => ({ id: 'game-1', userId: 'user-1', version: 1 })),
      deleteGame: jest.fn(() => false),
    })

    await expect(deleteGame({ gameId: 'game-1', userId: 'user-1', repo })).rejects.toMatchObject({
      type: 'notFound',
    })
  })

  test('rejects delete when user is unauthorized', async () => {
    const repo = buildRepo({
      getGameById: jest.fn(() => ({ id: 'game-1', userId: 'other', version: 1 })),
    })

    await expect(deleteGame({ gameId: 'game-1', userId: 'user-1', repo })).rejects.toMatchObject({
      type: 'forbidden',
    })
  })

  test('sanitizes metadata in list results', async () => {
    const repo = buildRepo({
      listGamesByUser: jest.fn(() => [
        {
          id: 'game-1',
          userId: 'user-1',
          name: 'Game',
          status: 'active',
          createdAt: 1,
          updatedAt: 2,
          players: [buildPlayer('Alex')],
          currentTurnState: {},
          metadata: { private: 'secret', safe: 'ok', secrets: 'nope' },
          version: 2,
        },
      ]),
    })

    const games = await listGamesByUser({ userId: 'user-1', repo })
    expect(games).toEqual([
      {
        id: 'game-1',
        name: 'Game',
        status: 'active',
        createdAt: 1,
        updatedAt: 2,
        players: [buildPlayer('Alex')],
        currentTurnState: {},
        metadata: { safe: 'ok' },
        version: 2,
      },
    ])
  })

  test('handles non-object metadata values', async () => {
    const repo = buildRepo({
      listGamesByUser: jest.fn(() => [
        {
          id: 'game-1',
          userId: 'user-1',
          name: 'Game',
          status: 'active',
          createdAt: 1,
          updatedAt: 2,
          players: [buildPlayer('Alex')],
          currentTurnState: {},
          metadata: 'not-an-object',
          version: 2,
        },
      ]),
    })

    const games = await listGamesByUser({ userId: 'user-1', repo })
    expect(games[0].metadata).toEqual({})
  })
})

describe('gameValidation', () => {
  test('validateCreatePayload reports player name issues', () => {
    const errors = validateCreatePayload({ name: 'Game', players: [{}] })
    expect(errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'players.0.name' })]),
    )
  })

  test('validateCreatePayload requires players array', () => {
    const errors = validateCreatePayload({ name: 'Game', players: 'nope' })
    expect(errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'players' })]),
    )
  })

  test('validateUpdatePayload catches missing fields', () => {
    const errors = validateUpdatePayload({ id: '', name: '', status: '' })
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'id' }),
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'status' }),
        expect.objectContaining({ field: 'createdAt' }),
        expect.objectContaining({ field: 'players' }),
        expect.objectContaining({ field: 'currentTurnState' }),
        expect.objectContaining({ field: 'metadata' }),
        expect.objectContaining({ field: 'version' }),
      ]),
    )
  })
})
