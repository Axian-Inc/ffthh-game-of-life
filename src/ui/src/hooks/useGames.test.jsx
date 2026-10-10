import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import useGames from './useGames'
import { ApiRequestError } from '../services/gameStorage'

const storageMocks = vi.hoisted(() => ({
  listGames: vi.fn(),
  advanceTurn: vi.fn(),
  createGame: vi.fn(),
  deleteGame: vi.fn(),
  updateGame: vi.fn(),
}))

vi.mock('../services/gameStorage', () => {
  class MockApiRequestError extends Error {
    constructor(status, body) {
      super(body?.message || 'Request failed')
      this.status = status
      this.body = body
    }
  }
  return {
    ApiRequestError: MockApiRequestError,
    createGameStorage: () => storageMocks,
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

it('reloads the latest games after a stale turn conflict', async () => {
  const original = { id: 'game-1', version: 3 }
  const latest = { id: 'game-1', version: 4 }
  storageMocks.listGames.mockResolvedValueOnce([original]).mockResolvedValueOnce([latest])
  storageMocks.advanceTurn.mockRejectedValue(
    new ApiRequestError(409, { code: 'TURN_CONFLICT', message: 'The turn is stale.', game: latest }),
  )
  const { result } = renderHook(() => useGames())

  await waitFor(() => expect(result.current.games).toEqual([original]))
  let conflict
  await act(async () => {
    try {
      await result.current.advanceTurn('game-1', { actionType: 'pass', expectedVersion: 3 })
    } catch (error) {
      conflict = error
    }
  })
  expect(conflict).toMatchObject({ status: 409 })
  await waitFor(() => expect(result.current.games).toEqual([latest]))
  expect(storageMocks.listGames).toHaveBeenCalledTimes(2)
})
