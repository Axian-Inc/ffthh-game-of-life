import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import PageShell from './components/layout/PageShell'
import Hero from './components/layout/Hero'
import GameListSection from './components/layout/GameListSection'
import GameErrorState from './components/games/GameErrorState'
import GameGrid from './components/games/GameGrid'
import ModalManager from './components/modals/ModalManager'
import TurnHandoffPage from './components/pages/TurnHandoffPage'
import TurnHubPage from './components/pages/TurnHubPage'
import TurnSummaryPage from './components/pages/TurnSummaryPage'
import WelcomeToLifePage from './components/pages/WelcomeToLifePage'
import useGames from './hooks/useGames'
import useModalState from './hooks/useModalState'
import { getGameStorageDebugSnapshot } from './services/gameStorage'
import { createInitialGameState } from './utils/turnEngine'

const parseAppRoute = (pathname) => {
  if (!pathname || pathname === '/') {
    return { view: 'home' }
  }

  const match = pathname.match(/^\/games\/([^/]+)\/(careers|play)$/)
  if (!match) {
    return { view: 'home' }
  }

  return {
    view: 'play',
    gameId: decodeURIComponent(match[1]),
  }
}

const buildAppRoute = (view, activeGame) => {
  if (view === 'play' && activeGame?.id) {
    return `/games/${encodeURIComponent(activeGame.id)}/play`
  }
  return '/'
}

const toJsonSafe = (value, fallback = null) => {
  if (value == null) {
    return fallback
  }
  return JSON.parse(JSON.stringify(value))
}

const getPlayStageForGame = (game, preferredStage = null) => {
  if (preferredStage === 'welcome') {
    return 'welcome'
  }
  if (!game) {
    return 'turn'
  }
  if (game.status === 'handoff') {
    return 'handoff'
  }
  return 'turn'
}

const buildInitialPlayers = (players) =>
  players.map((player, index) => ({
    id: player.id ?? `player-${index + 1}`,
    name: player.name.trim(),
    avatar: player.avatar,
    cityId: player.cityId,
    educationTrackId: player.educationTrackId,
    jobId: player.jobId,
  }))

function App() {
  const [resumeErrors, setResumeErrors] = useState({})
  const [deleteErrors, setDeleteErrors] = useState({})
  const [createError, setCreateError] = useState('')
  const [turnError, setTurnError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isAdvancingTurn, setIsAdvancingTurn] = useState(false)
  const [isStartingNextTurn, setIsStartingNextTurn] = useState(false)
  const [entrySource, setEntrySource] = useState('none')
  const [wizardDraft, setWizardDraft] = useState(null)
  const [routeRequest, setRouteRequest] = useState(() => parseAppRoute(window.location.pathname))
  const [hasHydratedRoute, setHasHydratedRoute] = useState(false)
  const [playStage, setPlayStage] = useState('turn')
  const [selectedActionId, setSelectedActionId] = useState('')
  const [activeTurnResolution, setActiveTurnResolution] = useState(null)
  const newGameCardRef = useRef(null)
  const newGameButtonRef = useRef(null)
  const { state, openCreate, openSession, openPlay, openDelete, closeAll } = useModalState()
  const { view, activeGame, activeGameMode, pendingDelete } = state
  const {
    games,
    isLoading,
    fetchError,
    loadGames,
    getGame,
    createGame,
    deleteGame,
    advanceTurn,
    beginNextTurn,
    newGameId,
    setNewGameId,
  } = useGames()
  const previousViewRef = useRef(view)

  const clearPlayState = useCallback(() => {
    setPlayStage('turn')
    setSelectedActionId('')
    setActiveTurnResolution(null)
    setTurnError('')
  }, [])

  const clearDebugState = useCallback(() => {
    setEntrySource('none')
    setWizardDraft(null)
    clearPlayState()
  }, [clearPlayState])

  const setPlayGame = useCallback(
    (game, nextStage = null) => {
      openPlay(game)
      setSelectedActionId('')
      setPlayStage(getPlayStageForGame(game, nextStage))
    },
    [openPlay],
  )

  const handleCreateClick = () => {
    openCreate()
    setCreateError('')
    clearDebugState()
  }

  const handleBackClick = () => {
    closeAll()
    setCreateError('')
    setIsCreating(false)
    clearDebugState()
  }

  const handleWizardStatusChange = useCallback((nextStatus) => {
    setWizardDraft(nextStatus ? toJsonSafe(nextStatus) : null)
  }, [])

  const handleCreateGame = async (wizardPayload) => {
    const payloadName = wizardPayload?.name?.trim() || ''
    const payloadPlayers = Array.isArray(wizardPayload?.players) ? wizardPayload.players : []
    if (!payloadName || payloadPlayers.length < 2) {
      setCreateError('Add at least two players before starting.')
      return
    }

    setIsCreating(true)
    setCreateError('')

    try {
      const newGame = createInitialGameState({
        name: payloadName,
        players: buildInitialPlayers(payloadPlayers),
      })
      const createdGame = await createGame(newGame)
      setEntrySource('create')
      setWizardDraft(null)
      setPlayGame(createdGame, 'welcome')
    } catch {
      setCreateError('We could not create that game yet. Please try again.')
    } finally {
      setIsCreating(false)
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
      const { [pendingDelete.id]: removedError, ...rest } = current
      return rest
    })
    try {
      await deleteGame(pendingDelete.id)
      closeAll()
      clearDebugState()
    } catch {
      setDeleteErrors((current) => ({
        ...current,
        [pendingDelete.id]: 'We could not delete that game yet. Please try again.',
      }))
      closeAll()
      clearDebugState()
    }
  }

  const handleDeleteCancel = () => {
    closeAll()
    clearDebugState()
  }

  const handleResumeGame = async (game) => {
    try {
      const latestGame = await getGame(game.id)
      setResumeErrors((current) => {
        if (!current[game.id]) {
          return current
        }
        const { [game.id]: removedError, ...rest } = current
        return rest
      })

      setEntrySource('resume')
      setWizardDraft(null)
      setActiveTurnResolution(null)
      setPlayGame(latestGame)
    } catch {
      setResumeErrors((current) => ({
        ...current,
        [game.id]: 'This saved game could not be loaded right now.',
      }))
    }
  }

  const handleViewResults = (game) => {
    openSession(game, 'results')
  }

  const handleBeginGame = () => {
    setPlayStage('turn')
    setSelectedActionId('')
    setTurnError('')
  }

  const handleTakeTurn = async () => {
    if (!activeGame) {
      return
    }
    const activePlayer = activeGame.players[activeGame.activePlayerIndex]
    if (!selectedActionId || !activePlayer) {
      setTurnError('Choose one action before taking the turn.')
      return
    }

    setIsAdvancingTurn(true)
    setTurnError('')
    try {
      const result = await advanceTurn(activeGame.id, {
        playerId: activePlayer.id,
        actionId: selectedActionId,
        version: activeGame.version,
      })
      setActiveTurnResolution(result.turnResolution)
      openPlay(result.game)
      setPlayStage('summary')
      setSelectedActionId('')
    } catch (error) {
      setTurnError(error instanceof Error ? error.message : 'The turn could not be resolved.')
    } finally {
      setIsAdvancingTurn(false)
    }
  }

  const handleContinueFromSummary = () => {
    setPlayStage('handoff')
    setTurnError('')
  }

  const handleStartNextTurn = async () => {
    if (!activeGame) {
      return
    }

    setIsStartingNextTurn(true)
    setTurnError('')
    try {
      const nextGame = await beginNextTurn(activeGame.id, activeGame)
      setActiveTurnResolution(null)
      setSelectedActionId('')
      openPlay(nextGame)
      setPlayStage('turn')
    } catch (error) {
      setTurnError(error instanceof Error ? error.message : 'The next turn could not be started.')
    } finally {
      setIsStartingNextTurn(false)
    }
  }

  const handleSaveAndExit = () => {
    closeAll()
    setEntrySource('none')
    setWizardDraft(null)
    clearPlayState()
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
    let isCancelled = false

    const hydrateRoute = async () => {
      if (!routeRequest) {
        return
      }

      if (routeRequest.view === 'home') {
        closeAll()
        clearDebugState()
        setRouteRequest(null)
        setHasHydratedRoute(true)
        return
      }

      try {
        const targetGame = await getGame(routeRequest.gameId)
        if (isCancelled) {
          return
        }
        setEntrySource('route')
        setWizardDraft(null)
        setActiveTurnResolution(null)
        setPlayGame(targetGame)
      } catch {
        if (isCancelled) {
          return
        }
        closeAll()
        clearDebugState()
      } finally {
        if (!isCancelled) {
          setRouteRequest(null)
          setHasHydratedRoute(true)
        }
      }
    }

    hydrateRoute()

    return () => {
      isCancelled = true
    }
  }, [routeRequest, getGame, closeAll, clearDebugState, setPlayGame])

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
  }, [newGameId, view, isLoading, setNewGameId])

  useEffect(() => {
    if (view !== 'session' && !pendingDelete) {
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
  }, [view, pendingDelete, isCreating, closeAll])

  useEffect(() => {
    if (previousViewRef.current === 'create' && view === 'home') {
      window.requestAnimationFrame(() => newGameButtonRef.current?.focus())
    }
    previousViewRef.current = view
  }, [view])

  const getLifeStatus = useCallback(() => {
    const { storageMode, storageKey, allGames } = getGameStorageDebugSnapshot(games)
    const activeGameId = activeGame?.id ? String(activeGame.id) : null
    const persistedGame = activeGameId ? allGames.find((game) => game.id === activeGameId) || null : null

    return toJsonSafe(
      {
        view,
        activeGameMode,
        entrySource,
        playStage,
        activeGameId,
        activeGame,
        activeTurnResolution,
        persistedGame,
        storageMode,
        storageKey,
        allGames,
        wizardDraft,
      },
      {},
    )
  }, [view, activeGameMode, entrySource, playStage, activeGame, activeTurnResolution, games, wizardDraft])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    window.life = {
      status: getLifeStatus,
    }

    return () => {
      delete window.life
    }
  }, [getLifeStatus])

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
        submitError: createError,
        isSubmitting: isCreating,
        onStatusChange: handleWizardStatusChange,
      }}
    />
  )

  const isModalOpen = view === 'create' || view === 'session' || Boolean(pendingDelete)
  const activePlayer = activeGame?.players?.[activeGame.activePlayerIndex] || null

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
      {view === 'play' && activeGame ? (
        playStage === 'welcome' ? (
          <WelcomeToLifePage game={activeGame} onBegin={handleBeginGame} />
        ) : playStage === 'summary' && activeTurnResolution ? (
          <TurnSummaryPage
            game={activeGame}
            turnResolution={activeTurnResolution}
            onContinue={handleContinueFromSummary}
          />
        ) : playStage === 'handoff' ? (
          <TurnHandoffPage
            game={activeGame}
            onStartNextTurn={handleStartNextTurn}
            onExit={handleSaveAndExit}
            isStarting={isStartingNextTurn}
            errorMessage={turnError}
          />
        ) : (
          <TurnHubPage
            game={activeGame}
            activePlayer={activePlayer}
            selectedActionId={selectedActionId}
            onSelectAction={setSelectedActionId}
            onTakeTurn={handleTakeTurn}
            onSaveAndExit={handleSaveAndExit}
            isSubmitting={isAdvancingTurn}
            errorMessage={turnError}
          />
        )
      ) : null}
    </PageShell>
  )
}

export default App
