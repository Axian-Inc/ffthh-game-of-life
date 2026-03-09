import { useEffect, useRef, useState } from 'react'
import './App.css'
import PageShell from './components/layout/PageShell'
import Hero from './components/layout/Hero'
import GameListSection from './components/layout/GameListSection'
import GameErrorState from './components/games/GameErrorState'
import GameGrid from './components/games/GameGrid'
import ModalManager from './components/modals/ModalManager'
import StartNewGamePage from './components/pages/StartNewGamePage'
import WelcomeToLifePage from './components/pages/WelcomeToLifePage'
import useGames from './hooks/useGames'
import useCreateGameForm from './hooks/useCreateGameForm'
import useModalState from './hooks/useModalState'

const parseAppRoute = (pathname) => {
  if (!pathname || pathname === '/') {
    return { view: 'home' }
  }

  const match = pathname.match(/^\/games\/([^/]+)\/(careers|play)$/)
  if (!match) {
    return { view: 'home' }
  }

  return {
    view: match[2] === 'careers' ? 'setup' : 'play',
    gameId: decodeURIComponent(match[1]),
  }
}

const buildAppRoute = (view, activeGame) => {
  if ((view === 'setup' || view === 'play') && activeGame?.id) {
    const suffix = view === 'setup' ? 'careers' : 'play'
    return `/games/${encodeURIComponent(activeGame.id)}/${suffix}`
  }
  return '/'
}

function App() {
  const [resumeErrors, setResumeErrors] = useState({})
  const [deleteErrors, setDeleteErrors] = useState({})
  const [createError, setCreateError] = useState('')
  const [setupError, setSetupError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [routeRequest, setRouteRequest] = useState(() => parseAppRoute(window.location.pathname))
  const [hasHydratedRoute, setHasHydratedRoute] = useState(false)
  const newGameCardRef = useRef(null)
  const newGameButtonRef = useRef(null)
  const { state, openCreate, openSession, openSetup, openPlay, openDelete, closeAll } = useModalState()
  const { view, activeGame, activeGameMode, pendingDelete } = state
  const { games, isLoading, fetchError, loadGames, createGame, deleteGame, updateGame, newGameId, setNewGameId } =
    useGames()
  const {
    gameName,
    setGameName,
    gameNameTouched,
    setGameNameTouched,
    players,
    draftPlayer,
    draftTouched,
    draftErrors,
    maxGameNameLength,
    maxPlayerNameLength,
    minPlayers,
    trimmedGameName,
    isGameNameTooLong,
    isGameNameValid,
    arePlayersValid,
    resetForm,
    markAllTouched,
    addPlayer,
    removePlayer,
    updateDraftName,
    markDraftTouched,
    cycleDraftAvatar,
  } = useCreateGameForm()
  const previousViewRef = useRef(view)

  const handleCreateClick = () => {
    openCreate()
    setGameNameTouched(false)
    setCreateError('')
  }

  const handleBackClick = () => {
    closeAll()
    resetForm()
    setCreateError('')
    setSetupError('')
    setIsCreating(false)
    setIsStartingGame(false)
  }

  const handleCreateGame = async () => {
    if (!isGameNameValid || !arePlayersValid) {
      markAllTouched()
      return
    }
    setIsCreating(true)
    setCreateError('')

    try {
      const timestamp = Date.now()
      const newGame = {
        name: trimmedGameName,
        status: 'active',
        players: players.map((player) => ({
          ...player,
          name: player.name.trim(),
        })),
        lastUpdated: timestamp,
        createdAt: timestamp,
        resumable: true,
      }
      const createdGame = await createGame(newGame)
      openSetup(createdGame)
      resetForm()
    } catch (error) {
      setCreateError('We could not create that game yet. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleAddPlayer = () => {
    addPlayer()
  }

  const handleStartGame = async (gameToStart) => {
    const game = gameToStart || activeGame
    if (!game) {
      return
    }
    setSetupError('')
    setIsStartingGame(true)
    try {
      const savedGame = await updateGame(game.id, {
        ...game,
        lastUpdated: Date.now(),
      })
      openPlay(savedGame)
    } catch (error) {
      setSetupError('We could not save career choices yet. Please try again.')
    } finally {
      setIsStartingGame(false)
    }
  }

  const handleDeleteRequest = (game) => {
    openDelete(game)
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) {
      return
    }
    setDeleteErrors((current) => {
      if (!current[pendingDelete.id]) {
        return current
      }
      const { [pendingDelete.id]: _, ...rest } = current
      return rest
    })
    try {
      await deleteGame(pendingDelete.id)
      closeAll()
    } catch (error) {
      setDeleteErrors((current) => ({
        ...current,
        [pendingDelete.id]: 'We could not delete that game yet. Please try again.',
      }))
      closeAll()
    }
  }

  const handleDeleteCancel = () => {
    closeAll()
  }

  const handleResumeGame = (game) => {
    if (!game.resumable) {
      setResumeErrors((current) => ({
        ...current,
        [game.id]: 'This game can’t be resumed. Start a new game or duplicate it.',
      }))
      return
    }

    setResumeErrors((current) => {
      if (!current[game.id]) {
        return current
      }
      const { [game.id]: _, ...rest } = current
      return rest
    })

    const hasPlayers = Array.isArray(game.players) && game.players.length > 0
    const hasPendingCareerChoices = hasPlayers && game.players.some((player) => !player.careerTrack)
    if (hasPendingCareerChoices) {
      openSetup(game)
      return
    }

    openPlay(game)
  }

  const handleViewResults = (game) => {
    openSession(game, 'results')
  }

  useEffect(() => {
    const handlePopState = () => {
      setRouteRequest(parseAppRoute(window.location.pathname))
      setHasHydratedRoute(false)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (!routeRequest) {
      return
    }

    if (routeRequest.view === 'home') {
      closeAll()
      setRouteRequest(null)
      setHasHydratedRoute(true)
      return
    }

    if (isLoading) {
      return
    }

    const targetGame = games.find((game) => game.id === routeRequest.gameId)
    if (!targetGame) {
      closeAll()
      setRouteRequest(null)
      setHasHydratedRoute(true)
      return
    }

    if (routeRequest.view === 'setup') {
      openSetup(targetGame)
    } else {
      openPlay(targetGame)
    }

    setRouteRequest(null)
    setHasHydratedRoute(true)
  }, [routeRequest, isLoading, games, closeAll, openSetup, openPlay])

  useEffect(() => {
    if (!hasHydratedRoute) {
      return
    }

    const nextPath = buildAppRoute(view, activeGame)
    if (window.location.pathname !== nextPath) {
      window.history.replaceState({}, '', nextPath)
    }
  }, [view, activeGame, hasHydratedRoute])

  useEffect(() => {
    if (!newGameId || view !== 'home' || isLoading) {
      return
    }
    if (newGameCardRef.current) {
      newGameCardRef.current.focus()
      setNewGameId(null)
    }
  }, [newGameId, view, isLoading])

  useEffect(() => {
    if (view !== 'create' && view !== 'session' && !pendingDelete) {
      return
    }

    const handleKeyDown = (event) => {
      if (isCreating) {
        return
      }
      if (event.key === 'Escape') {
        closeAll()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, pendingDelete, isCreating])

  useEffect(() => {
    if (previousViewRef.current === 'create' && view === 'home') {
      window.requestAnimationFrame(() => newGameButtonRef.current?.focus())
    }
    previousViewRef.current = view
  }, [view])

  const handleBackdropClick = (event) => {
    if (isCreating) {
      return
    }
    if (event.target === event.currentTarget) {
      closeAll()
    }
  }

  const now = Date.now()
  const modals = (
    <ModalManager
      view={view}
      activeGame={activeGame}
      activeGameMode={activeGameMode}
      pendingDelete={pendingDelete}
      onBackdropClick={handleBackdropClick}
      onCloseAll={handleBackClick}
      onDeleteCancel={handleDeleteCancel}
      onDeleteConfirm={handleDeleteConfirm}
      createGameProps={{
        onSubmit: handleCreateGame,
        gameName,
        onGameNameChange: (event) => setGameName(event.target.value),
        onGameNameBlur: () => setGameNameTouched(true),
        gameNameTouched,
        isGameNameValid,
        isGameNameTooLong,
        maxGameNameLength,
        players,
        minPlayers,
        maxPlayerNameLength,
        draftPlayer,
        draftTouched,
        draftErrors,
        arePlayersValid,
        onAddPlayer: handleAddPlayer,
        onRemovePlayer: removePlayer,
        onDraftNameChange: (event) => updateDraftName(event.target.value),
        onDraftBlur: markDraftTouched,
        onDraftAvatarSelect: (avatarKey) => updateDraftField('avatar', avatarKey),
        onDraftAvatarCycle: cycleDraftAvatar,
        createError,
        isCreating,
      }}
    />
  )

  const isModalOpen = view === 'create' || view === 'session' || Boolean(pendingDelete)

  return (
    <PageShell isBlurred={isModalOpen} modals={modals}>
      {view === 'home' ? (
        <>
          <Hero onCreate={handleCreateClick} buttonRef={newGameButtonRef} />
          <GameListSection count={games.length} isLoading={isLoading}>
            {fetchError ? (
              <GameErrorState message={fetchError} onRetry={() => loadGames()} />
            ) : (
              <GameGrid
                games={games}
                isLoading={isLoading}
                now={now}
                onResume={handleResumeGame}
                onViewResults={handleViewResults}
                onDelete={handleDeleteRequest}
                resumeErrors={resumeErrors}
                deleteErrors={deleteErrors}
                newGameId={newGameId}
                newGameCardRef={newGameCardRef}
              />
            )}
          </GameListSection>
        </>
      ) : null}
      {view === 'setup' ? (
        <StartNewGamePage
          game={activeGame}
          onStart={handleStartGame}
          onBack={closeAll}
          isStarting={isStartingGame}
          startError={setupError}
        />
      ) : null}
      {view === 'play' ? <WelcomeToLifePage game={activeGame} onBegin={closeAll} /> : null}
    </PageShell>
  )
}

export default App
