import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import PageShell from './components/layout/PageShell'
import Hero from './components/layout/Hero'
import GameListSection from './components/layout/GameListSection'
import GameErrorState from './components/games/GameErrorState'
import GameGrid from './components/games/GameGrid'
import ModalManager from './components/modals/ModalManager'
import WelcomeToLifePage from './components/pages/WelcomeToLifePage'
import TakeTurnPage from './components/pages/TakeTurnPage'
import TurnSummaryPage from './components/pages/TurnSummaryPage'
import useGames from './hooks/useGames'
import useModalState from './hooks/useModalState'
import { getGameStorageDebugSnapshot } from './services/gameStorage'
import {
  advanceFromSummary,
  beginGameFromWelcome,
  ensurePlayableGame,
  initializeGameForPlay,
  resolveTurn,
} from './services/gameplay'

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

function App() {
  const [resumeErrors, setResumeErrors] = useState({})
  const [deleteErrors, setDeleteErrors] = useState({})
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isSavingTurn, setIsSavingTurn] = useState(false)
  const [turnError, setTurnError] = useState('')
  const [entrySource, setEntrySource] = useState('none')
  const [wizardDraft, setWizardDraft] = useState(null)
  const [routeRequest, setRouteRequest] = useState(() => parseAppRoute(window.location.pathname))
  const [hasHydratedRoute, setHasHydratedRoute] = useState(false)
  const newGameCardRef = useRef(null)
  const newGameButtonRef = useRef(null)
  const { state, openCreate, openSession, openPlay, openDelete, closeAll } = useModalState()
  const { view, activeGame, activeGameMode, pendingDelete } = state
  const { games, isLoading, fetchError, loadGames, createGame, deleteGame, updateGame, newGameId, setNewGameId } = useGames()
  const previousViewRef = useRef(view)
  const clearDebugState = useCallback(() => {
    setEntrySource('none')
    setWizardDraft(null)
    setTurnError('')
  }, [])

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
      const timestamp = Date.now()
      const newGame = initializeGameForPlay({
        name: payloadName,
        status: 'active',
        players: payloadPlayers.map((player) => ({
          ...player,
          name: player.name.trim(),
        })),
        lastUpdated: timestamp,
        createdAt: timestamp,
        resumable: true,
      })
      const createdGame = await createGame(newGame)
      setEntrySource('create')
      setWizardDraft(null)
      openPlay(createdGame)
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
      const { [pendingDelete.id]: _, ...rest } = current
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

    setEntrySource('resume')
    setWizardDraft(null)
    setTurnError('')
    openPlay(ensurePlayableGame(game))
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
      clearDebugState()
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
      clearDebugState()
      setRouteRequest(null)
      setHasHydratedRoute(true)
      return
    }

    setEntrySource('route')
    setWizardDraft(null)
    openPlay(ensurePlayableGame(targetGame))

    setRouteRequest(null)
    setHasHydratedRoute(true)
  }, [routeRequest, isLoading, games, closeAll, openPlay, clearDebugState])

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

  const persistActiveGame = useCallback(
    async (nextGame) => {
      const persistedGame = await updateGame(nextGame.id, nextGame)
      openPlay(ensurePlayableGame(persistedGame))
      return persistedGame
    },
    [openPlay, updateGame],
  )

  const handleBeginGame = useCallback(async () => {
    if (!activeGame) {
      return
    }

    setIsSavingTurn(true)
    setTurnError('')

    try {
      await persistActiveGame(beginGameFromWelcome(activeGame))
    } catch {
      setTurnError('We could not start that turn yet. Please try again.')
    } finally {
      setIsSavingTurn(false)
    }
  }, [activeGame, persistActiveGame])

  const handleCompleteTurn = useCallback(
    async (actionId) => {
      if (!activeGame) {
        return
      }

      setIsSavingTurn(true)
      setTurnError('')

      try {
        await persistActiveGame(resolveTurn(activeGame, actionId))
      } catch {
        setTurnError('We could not save that turn yet. Please try again.')
      } finally {
        setIsSavingTurn(false)
      }
    },
    [activeGame, persistActiveGame],
  )

  const handleContinueFromSummary = useCallback(async () => {
    if (!activeGame) {
      return
    }

    setIsSavingTurn(true)
    setTurnError('')

    try {
      await persistActiveGame(advanceFromSummary(activeGame))
    } catch {
      setTurnError('We could not move to the next turn yet. Please try again.')
    } finally {
      setIsSavingTurn(false)
    }
  }, [activeGame, persistActiveGame])

  const getLifeStatus = useCallback(() => {
    const { storageMode, storageKey, allGames } = getGameStorageDebugSnapshot(games)
    const activeGameId = activeGame?.id ? String(activeGame.id) : null
    const persistedGame = activeGameId ? allGames.find((game) => game.id === activeGameId) || null : null

    return toJsonSafe({
      view,
      activeGameMode,
      entrySource,
      activeGameId,
      activeGame,
      persistedGame,
      storageMode,
      storageKey,
      allGames,
      wizardDraft,
    }, {})
  }, [view, activeGameMode, entrySource, activeGame, games, wizardDraft])

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
      {view === 'play' ? (
        activeGame?.playState?.view === 'summary' ? (
          <TurnSummaryPage
            game={activeGame}
            onContinue={handleContinueFromSummary}
            onHome={handleBackClick}
            isSaving={isSavingTurn}
            summaryError={turnError}
          />
        ) : activeGame?.playState?.view === 'turn' ? (
          <TakeTurnPage
            game={activeGame}
            onCompleteTurn={handleCompleteTurn}
            onHome={handleBackClick}
            isSaving={isSavingTurn}
            turnError={turnError}
          />
        ) : (
          <WelcomeToLifePage
            game={activeGame}
            onBegin={handleBeginGame}
            isStarting={isSavingTurn}
            startError={turnError}
          />
        )
      ) : null}
    </PageShell>
  )
}

export default App
