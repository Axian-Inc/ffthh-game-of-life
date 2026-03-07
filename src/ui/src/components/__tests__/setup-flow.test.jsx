import { act, renderHook, waitFor } from '@testing-library/react'
import useCreateGameForm from '../../hooks/useCreateGameForm'
import useGames from '../../hooks/useGames'
import { GAME_STORAGE_KEY } from '../../services/gameStorage'
import { createGame, createPlayer } from '../../test/testUtils'

describe('Wave 1 setup and persistence contract', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('keeps one authoritative draft and prevents duplicate player names', async () => {
    const { result } = renderHook(() => useCreateGameForm())

    act(() => {
      result.current.setGameName('Step 1 Title')
      result.current.setCurrentStep(3)
      result.current.setDraftPlayerData({
        name: 'Ari',
        cityId: 'city-1',
        educationTrackId: 'education-1',
        jobId: 'job-1',
      })
    })

    await act(async () => {
      result.current.addPlayer()
    })

    expect(result.current.players).toHaveLength(1)
    expect(result.current.players[0]).toMatchObject({
      name: 'Ari',
      cityId: 'city-1',
      educationTrackId: 'education-1',
      jobId: 'job-1',
      careerTrack: '',
    })

    act(() => {
      result.current.setDraftPlayerData({ name: 'Ari' })
    })
    expect(result.current.draftErrors.name).toBe('Names must be unique.')

    act(() => {
      result.current.setDraftPlayerData({
        name: 'Blake',
        cityId: 'city-2',
        educationTrackId: 'education-2',
        jobId: 'job-2',
      })
    })

    expect(result.current.players[0]).toMatchObject({
      name: 'Ari',
      cityId: 'city-1',
      educationTrackId: 'education-1',
      jobId: 'job-1',
    })
    expect(result.current.setupDraft).toMatchObject({
      name: 'Step 1 Title',
      currentStep: 3,
      players: [expect.objectContaining({ name: 'Ari' })],
      draftPlayer: expect.objectContaining({
        name: 'Blake',
        cityId: 'city-2',
      }),
    })
  })

  it('persists only on Start Game and saves final title plus all committed players', async () => {
    const baselineGame = createGame({ id: 'existing-1', name: 'Existing Save' })
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify([baselineGame]))

    const { result } = renderHook(() => useGames())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.games).toHaveLength(1)

    let draftGame
    await act(async () => {
      draftGame = await result.current.createGame({
        name: 'Step 1 Working Title',
        status: 'active',
        currentStep: 6,
        players: [
          createPlayer({
            id: 'p-1',
            name: 'Ari',
            cityId: 'city-1',
            educationTrackId: 'education-1',
            jobId: 'job-1',
            careerTrack: 'Degree Track',
          }),
          createPlayer({
            id: 'p-2',
            name: 'Blake',
            cityId: 'city-2',
            educationTrackId: 'education-2',
            jobId: 'job-2',
            careerTrack: 'Trades Track',
          }),
        ],
        lastUpdated: Date.now(),
        createdAt: Date.now(),
        resumable: true,
      })
    })

    expect(result.current.games).toHaveLength(1)
    const gamesBeforeStart = JSON.parse(window.localStorage.getItem(GAME_STORAGE_KEY) || '[]')
    expect(gamesBeforeStart).toHaveLength(1)
    expect(gamesBeforeStart.some((game) => game.id === draftGame.id)).toBe(false)

    await act(async () => {
      await result.current.updateGame(draftGame.id, {
        ...draftGame,
        name: 'Final Step 6 Title',
        currentStep: 0,
      })
    })

    expect(result.current.games[0]).toMatchObject({
      id: draftGame.id,
      name: 'Final Step 6 Title',
      currentStep: 0,
    })

    const persistedGames = JSON.parse(window.localStorage.getItem(GAME_STORAGE_KEY) || '[]')
    const created = persistedGames.find((game) => game.id === draftGame.id)
    expect(created).toMatchObject({
      name: 'Final Step 6 Title',
      players: [
        expect.objectContaining({
          id: 'p-1',
          name: 'Ari',
          cityId: 'city-1',
          educationTrackId: 'education-1',
          jobId: 'job-1',
          careerTrack: 'Degree Track',
        }),
        expect.objectContaining({
          id: 'p-2',
          name: 'Blake',
          cityId: 'city-2',
          educationTrackId: 'education-2',
          jobId: 'job-2',
          careerTrack: 'Trades Track',
        }),
      ],
    })
    expect(result.current.newGameId).toBe(draftGame.id)
  })
})
