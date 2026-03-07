import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import useCreateGameForm from '../../hooks/useCreateGameForm'
import { createGameStorage } from '../../services/gameStorage'

const STORAGE_KEY = 'ffthh-game-of-life.games'

describe('setup draft and persistence contract', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'existing-game',
          name: 'Existing Game',
          status: 'active',
          players: [],
          lastUpdated: 1,
          createdAt: 1,
          resumable: true,
        },
      ]),
    )
  })

  it('keeps setup state in a local draft shape and enforces unique player names', () => {
    const { result } = renderHook(() => useCreateGameForm())

    expect(result.current.minPlayers).toBe(2)

    act(() => {
      result.current.setGameName('  Wave 1 Draft  ')
      result.current.updateDraftName('Alex')
      result.current.updateDraftField('cityId', 'city-seattle')
      result.current.updateDraftField('educationTrackId', 'degree-track')
      result.current.updateDraftField('jobId', 'software-engineer')
    })

    act(() => {
      result.current.addPlayer()
    })

    expect(result.current.players).toHaveLength(1)
    expect(result.current.players[0]).toMatchObject({
      name: 'Alex',
      cityId: 'city-seattle',
      educationTrackId: 'degree-track',
      jobId: 'software-engineer',
    })
    expect(result.current.arePlayersValid).toBe(false)

    act(() => {
      result.current.updateDraftName('Alex')
    })

    expect(result.current.draftErrors.name).toBe('Names must be unique.')

    act(() => {
      result.current.updateDraftName('Sam')
      result.current.updateDraftField('cityId', 'city-atlanta')
      result.current.updateDraftField('educationTrackId', 'trades-track')
      result.current.updateDraftField('jobId', 'electrician')
    })

    act(() => {
      result.current.addPlayer()
    })

    expect(result.current.players).toHaveLength(2)
    expect(result.current.arePlayersValid).toBe(true)
    expect(result.current.trimmedGameName).toBe('Wave 1 Draft')
  })

  it('does not persist on createGame and persists finalized name/players on updateGame', async () => {
    const storage = createGameStorage()

    const draft = await storage.createGame({
      name: 'Early Name',
      status: 'active',
      players: [
        {
          id: 'player-1',
          name: 'Alex',
          avatar: 'monkey-face',
          cityId: 'city-seattle',
          educationTrackId: 'degree-track',
          jobId: 'software-engineer',
          careerTrack: 'Degree Track',
        },
      ],
      resumable: true,
      createdAt: 100,
      lastUpdated: 100,
    })

    expect(draft.id).toMatch(/^draft-/)
    expect(draft.draft).toBe(true)

    const gamesAfterCreate = await storage.listGames()
    expect(gamesAfterCreate).toHaveLength(1)
    expect(gamesAfterCreate[0].name).toBe('Existing Game')

    const finalized = await storage.updateGame(draft.id, {
      ...draft,
      name: 'Final Edited Name',
      draft: false,
      players: [
        {
          id: 'player-1',
          name: 'Alex',
          avatar: 'monkey-face',
          cityId: 'city-seattle',
          educationTrackId: 'degree-track',
          jobId: 'software-engineer',
          careerTrack: 'Degree Track',
        },
        {
          id: 'player-2',
          name: 'Sam',
          avatar: 'tiger-face',
          cityId: 'city-atlanta',
          educationTrackId: 'trades-track',
          jobId: 'electrician',
          careerTrack: 'Trades Track',
        },
      ],
      createdAt: 101,
      lastUpdated: 101,
      resumable: true,
      status: 'active',
    })

    expect(finalized.id).not.toBe(draft.id)
    expect(finalized.name).toBe('Final Edited Name')
    expect(finalized.players).toHaveLength(2)

    const gamesAfterFinalize = await storage.listGames()
    expect(gamesAfterFinalize[0]).toMatchObject({
      id: finalized.id,
      name: 'Final Edited Name',
    })
    expect(gamesAfterFinalize[0].players).toHaveLength(2)
  })
})
