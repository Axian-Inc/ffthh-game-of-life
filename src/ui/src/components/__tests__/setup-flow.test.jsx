import { useState } from 'react'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CreateGameModal from '../modals/CreateGameModal'
import useCreateGameForm from '../../hooks/useCreateGameForm'
import useGames from '../../hooks/useGames'
import { createGameStorage } from '../../services/gameStorage'

const SetupFlowHarness = ({ onSubmit = vi.fn() }) => {
  const [gameName, setGameName] = useState('')
  const [gameNameTouched, setGameNameTouched] = useState(false)
  const [players, setPlayers] = useState([])
  const [draftPlayer, setDraftPlayer] = useState({
    name: '',
    avatar: 'octopus',
    cityId: '',
    educationTrackId: '',
    jobId: '',
    careerTrack: '',
  })
  const [draftTouched, setDraftTouched] = useState({ name: false })

  const draftErrors = {
    name: draftPlayer.name.trim() ? '' : 'Enter a player name.',
  }

  return (
    <CreateGameModal
      isOpen
      onBackdropClick={vi.fn()}
      onCancel={vi.fn()}
      onSubmit={onSubmit}
      gameName={gameName}
      onGameNameChange={(event) => setGameName(event.target.value)}
      onGameNameBlur={() => setGameNameTouched(true)}
      gameNameTouched={gameNameTouched}
      isGameNameValid={gameName.trim().length > 0}
      isGameNameTooLong={false}
      maxGameNameLength={60}
      players={players}
      minPlayers={2}
      maxPlayerNameLength={24}
      draftPlayer={draftPlayer}
      draftTouched={draftTouched}
      draftErrors={draftErrors}
      arePlayersValid={players.length >= 2}
      onAddPlayer={() => {
        if (!draftPlayer.name.trim()) {
          setDraftTouched({ name: true })
          return false
        }

        setPlayers((current) => [
          ...current,
          {
            id: `player-${current.length + 1}`,
            name: draftPlayer.name.trim(),
            avatar: draftPlayer.avatar,
            cityId: draftPlayer.cityId,
            educationTrackId: draftPlayer.educationTrackId,
            jobId: draftPlayer.jobId,
            careerTrack: draftPlayer.careerTrack,
          },
        ])
        setDraftPlayer({
          name: '',
          avatar: 'octopus',
          cityId: '',
          educationTrackId: '',
          jobId: '',
          careerTrack: '',
        })
        setDraftTouched({ name: false })
        return true
      }}
      onRemovePlayer={vi.fn()}
      onDraftNameChange={(event) => setDraftPlayer((current) => ({ ...current, name: event.target.value }))}
      onDraftBlur={(field) => setDraftTouched((current) => ({ ...current, [field]: true }))}
      onDraftAvatarCycle={() =>
        setDraftPlayer((current) => ({
          ...current,
          avatar: current.avatar === 'octopus' ? 'snake' : 'octopus',
        }))
      }
      createError=""
      isCreating={false}
    />
  )
}

const addPlayerThroughWizard = async (user, name) => {
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.type(screen.getByLabelText('Player Name:'), name)
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
}

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

describe('setup flow wizard', () => {
  it('keeps start disabled until two configured players exist', async () => {
    const user = userEvent.setup()
    render(<SetupFlowHarness />)

    await user.type(screen.getByLabelText('Game Name:'), 'Choices Matter')
    await addPlayerThroughWizard(user, 'Ari')

    expect(await screen.findByRole('button', { name: 'Start Game' })).toBeDisabled()
    expect(screen.getByText('Step 6 of 6')).toBeInTheDocument()
  })

  it('submits the final payload with the edited summary title', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SetupFlowHarness onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Game Name:'), 'Original')
    await addPlayerThroughWizard(user, 'Ari')
    await user.click(await screen.findByRole('button', { name: '+ New Player' }))
    await user.type(screen.getByLabelText('Player Name:'), 'Mia')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.clear(screen.getByLabelText('Game Name:'))
    await user.type(screen.getByLabelText('Game Name:'), 'Updated Title')
    await user.click(screen.getByRole('button', { name: 'Start Game' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Updated Title',
        players: [
          expect.objectContaining({
            name: 'Ari',
            cityId: 'denver',
            educationTrackId: 'trades-track',
            jobId: 'electrician',
            careerTrack: 'Trades Track',
          }),
          expect.objectContaining({
            name: 'Mia',
            cityId: 'denver',
            educationTrackId: 'trades-track',
            jobId: 'electrician',
            careerTrack: 'Trades Track',
          }),
        ],
      }),
    )
  })
})
