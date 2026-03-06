import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useCreateGameForm from '../../hooks/useCreateGameForm'
import useGames from '../../hooks/useGames'
import { createGameStorage } from '../../services/gameStorage'

describe('setup draft and persistence contract', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.unstubAllEnvs()
  })

  it('tracks one authoritative draft with top-level name, committed players, draft player, and step', () => {
    const { result } = renderHook(() => useCreateGameForm())

    expect(result.current.draft).toEqual({
      name: '',
      players: [],
      draftPlayer: {
        name: '',
        avatar: 'monkey-face',
        cityId: '',
        educationTrackId: '',
        jobId: '',
      },
      currentStep: 1,
    })

    act(() => result.current.setGameName('  Final Family Night  '))
    act(() => result.current.updateDraftName('Jordan'))
    act(() => result.current.updateDraftPlayerField('cityId', 'denver-co'))
    act(() => result.current.updateDraftPlayerField('educationTrackId', 'degree-track'))
    act(() => result.current.updateDraftPlayerField('jobId', 'engineer'))
    act(() => result.current.setCurrentStep(6))
    act(() => {
      result.current.addPlayer()
    })

    expect(result.current.draft.name).toBe('  Final Family Night  ')
    expect(result.current.players).toEqual([
      expect.objectContaining({
        name: 'Jordan',
        cityId: 'denver-co',
        educationTrackId: 'degree-track',
        jobId: 'engineer',
        careerTrack: '',
      }),
    ])
    expect(result.current.draftPlayer).toEqual({
      name: '',
      avatar: expect.any(String),
      cityId: '',
      educationTrackId: '',
      jobId: '',
    })
    expect(result.current.currentStep).toBe(6)
  })

  it('requires at least two uniquely named players before start is valid', () => {
    const { result } = renderHook(() => useCreateGameForm())

    act(() => result.current.setGameName('Game Night'))
    act(() => result.current.updateDraftName('Alex'))
    act(() => {
      result.current.addPlayer()
    })

    expect(result.current.arePlayersValid).toBe(false)

    act(() => result.current.updateDraftName('Alex'))
    act(() => {
      result.current.addPlayer()
    })

    expect(result.current.draftErrors.name).toBe('Names must be unique.')

    act(() => result.current.updateDraftName('Blair'))
    act(() => {
      result.current.addPlayer()
    })

    expect(result.current.arePlayersValid).toBe(true)
  })

  it('does not persist a new game until updateGame saves it', async () => {
    const storage = createGameStorage()
    const initialGames = await storage.listGames()
    const draftGame = await storage.createGame({
      name: 'Draft Only',
      players: [
        {
          id: 'p1',
          name: 'Alex',
          avatar: 'monkey-face',
          cityId: 'denver-co',
          educationTrackId: 'degree-track',
          jobId: 'engineer',
          careerTrack: 'Degree Track',
        },
      ],
    })

    expect(await storage.listGames()).toHaveLength(initialGames.length)

    await storage.updateGame(draftGame.id, {
      ...draftGame,
      name: 'Saved Game',
      players: [
        draftGame.players[0],
        {
          id: 'p2',
          name: 'Blair',
          avatar: 'fox-face',
          cityId: 'portland-or',
          educationTrackId: 'trades-track',
          jobId: 'electrician',
          careerTrack: 'Trades Track',
        },
      ],
    })

    const savedGames = await storage.listGames()
    expect(savedGames).toHaveLength(initialGames.length + 1)
    expect(savedGames[0]).toEqual(
      expect.objectContaining({
        id: draftGame.id,
        name: 'Saved Game',
        players: [
          expect.objectContaining({ name: 'Alex', cityId: 'denver-co', jobId: 'engineer' }),
          expect.objectContaining({ name: 'Blair', cityId: 'portland-or', jobId: 'electrician' }),
        ],
      }),
    )
  })

  it('keeps transient drafts out of the home list until the final save succeeds', async () => {
    const { result } = renderHook(() => useGames())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const initialCount = result.current.games.length
    let draftGame

    await act(async () => {
      draftGame = await result.current.createGame({
        name: 'Choices Matter',
        status: 'active',
        players: [
          {
            id: 'p1',
            name: 'Alex',
            avatar: 'monkey-face',
            cityId: 'denver-co',
            educationTrackId: 'degree-track',
            jobId: 'engineer',
            careerTrack: 'Degree Track',
          },
          {
            id: 'p2',
            name: 'Blair',
            avatar: 'fox-face',
            cityId: 'portland-or',
            educationTrackId: 'trades-track',
            jobId: 'electrician',
            careerTrack: 'Trades Track',
          },
        ],
        lastUpdated: Date.now(),
        createdAt: Date.now(),
        resumable: true,
      })
    })

    expect(result.current.games).toHaveLength(initialCount)

    await act(async () => {
      await result.current.updateGame(draftGame.id, {
        ...draftGame,
        name: 'Final Choices Matter',
      })
    })

    expect(result.current.games).toHaveLength(initialCount + 1)
    expect(result.current.games[0]).toEqual(
      expect.objectContaining({
        id: draftGame.id,
        name: 'Final Choices Matter',
      }),
    )
  })
})
