import { render, screen, renderHook, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import NewGameWizard from '../forms/NewGameWizard'
import useCreateGameForm from '../../hooks/useCreateGameForm'
import { createGameStorage } from '../../services/gameStorage'

const completeOnePlayer = async (user, name) => {
  await user.type(screen.getByLabelText('Player Name:'), name)
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: /San Francisco, CA/i }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: /Degree Track/i }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: /Software Engineer/i }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
}

describe('NewGameWizard setup flow', () => {
  it('requires a trimmed game name on Step 1', async () => {
    const user = userEvent.setup()
    render(<NewGameWizard onCancel={vi.fn()} onSubmit={vi.fn()} />)

    const next = screen.getByRole('button', { name: 'Next' })
    expect(next).toBeDisabled()

    await user.type(screen.getByLabelText('Game Name:'), '   Choices Matter   ')
    expect(next).toBeEnabled()
  })

  it('submits final payload with two configured players', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<NewGameWizard onCancel={vi.fn()} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Game Name:'), 'Wizard Test Game')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await completeOnePlayer(user, 'Alex')
    await user.click(screen.getByRole('button', { name: '+ New Player' }))
    await completeOnePlayer(user, 'Sam')

    const start = screen.getByRole('button', { name: 'Start Game' })
    expect(start).toBeEnabled()
    await user.click(start)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Wizard Test Game',
      players: [
        {
          id: 'player-1',
          name: 'Alex',
          avatar: 'octopus',
          cityId: 'san-francisco',
          educationTrackId: 'degree-track',
          jobId: 'software-engineer',
          careerTrack: 'Degree Track',
        },
        {
          id: 'player-2',
          name: 'Sam',
          avatar: 'snake',
          cityId: 'san-francisco',
          educationTrackId: 'degree-track',
          jobId: 'software-engineer',
          careerTrack: 'Degree Track',
        },
      ],
    })
  })
})

describe('Wave 1 setup draft contract', () => {
  it('maintains a single setup draft and commits full player records', () => {
    const { result } = renderHook(() => useCreateGameForm())

    expect(result.current.setupDraft).toEqual(
      expect.objectContaining({
        name: '',
        players: [],
        draftPlayer: expect.objectContaining({
          name: '',
          avatar: expect.any(String),
          cityId: expect.any(String),
          educationTrackId: expect.any(String),
          jobId: expect.any(String),
        }),
        currentStep: 1,
      }),
    )

    act(() => {
      result.current.setGameName('Choices Matter')
      result.current.updateDraftName('Alex')
    })

    act(() => {
      result.current.addPlayer()
    })

    expect(result.current.players).toHaveLength(1)
    expect(result.current.players[0]).toEqual(
      expect.objectContaining({
        id: 'player-1',
        name: 'Alex',
        avatar: expect.any(String),
        cityId: expect.any(String),
        educationTrackId: expect.any(String),
        jobId: expect.any(String),
        careerTrack: null,
      }),
    )

    act(() => {
      result.current.updateDraftName('Alex')
    })

    let added = false
    act(() => {
      added = result.current.addPlayer()
    })

    expect(added).toBe(false)
    expect(result.current.players).toHaveLength(1)
  })
})

describe('Wave 1 persistence contract', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('does not persist a new game until update/final start, then keeps all players and final title', async () => {
    const storage = createGameStorage()
    const baselineGames = await storage.listGames()

    const draft = await storage.createGame({
      name: 'Initial Draft Name',
      status: 'active',
      players: [
        {
          id: 'player-1',
          name: 'Alex',
          avatar: 'monkey-face',
          cityId: 'city-balanced',
          educationTrackId: 'education-street-smart',
          jobId: 'job-entry-generalist',
          careerTrack: null,
        },
      ],
      currentStep: 6,
      createdAt: 100,
      lastUpdated: 100,
      resumable: true,
    })

    const afterDraftGames = await storage.listGames()
    expect(afterDraftGames).toHaveLength(baselineGames.length)

    const setupDrafts = JSON.parse(window.localStorage.getItem('ffthh-game-of-life.setup-drafts') || '[]')
    expect(setupDrafts).toEqual(expect.arrayContaining([expect.objectContaining({ id: draft.id, isDraft: true })]))

    await storage.updateGame(draft.id, {
      ...draft,
      name: 'Edited Final Name',
      players: [
        {
          id: 'player-1',
          name: 'Alex',
          avatar: 'monkey-face',
          cityId: 'city-balanced',
          educationTrackId: 'education-street-smart',
          jobId: 'job-entry-generalist',
          careerTrack: 'Degree Track',
        },
        {
          id: 'player-2',
          name: 'Jamie',
          avatar: 'cat-face',
          cityId: 'city-opportunity',
          educationTrackId: 'education-degree',
          jobId: 'job-entry-analyst',
          careerTrack: 'Creator Track',
        },
      ],
      lastUpdated: 200,
      isDraft: false,
    })

    const savedGames = await storage.listGames()
    expect(savedGames[0]).toEqual(
      expect.objectContaining({
        id: draft.id,
        name: 'Edited Final Name',
        players: [
          expect.objectContaining({ id: 'player-1', cityId: 'city-balanced', careerTrack: 'Degree Track' }),
          expect.objectContaining({ id: 'player-2', cityId: 'city-opportunity', careerTrack: 'Creator Track' }),
        ],
      }),
    )

    const draftsAfterSave = JSON.parse(window.localStorage.getItem('ffthh-game-of-life.setup-drafts') || '[]')
    expect(draftsAfterSave).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: draft.id })]))
  })
})
