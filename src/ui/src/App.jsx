import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import PageShell from './components/layout/PageShell'
import Hero from './components/layout/Hero'
import GameListSection from './components/layout/GameListSection'
import GameErrorState from './components/games/GameErrorState'
import GameGrid from './components/games/GameGrid'
import ModalManager from './components/modals/ModalManager'
import PlayGamePage from './components/pages/PlayGamePage'
import WelcomeToLifePage from './components/pages/WelcomeToLifePage'
import useGames from './hooks/useGames'
import useModalState from './hooks/useModalState'
import { getGameStorageDebugSnapshot } from './services/gameStorage'
import { createDefaultModifierContext, initializePlayerState } from './simulation/playerState'
import { getAvailableTurnActions } from './simulation/actionCatalog'
import { buildTurnBrief, buildTurnReveal } from './simulation/turnPresentation'
import { resolvePlayerTurn } from './simulation/turnResolver'

const EMPTY_TURN_PLAN = {
  stage: 'brief',
  actionPoints: 0,
  remainingActionPoints: 0,
  selectedActions: [],
  curatedActions: [],
  issueActions: [],
  explanation: '',
  brief: null,
  reveal: null,
}

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

const normalizeTurnNumber = (turnNumber) => {
  if (!Number.isInteger(turnNumber) || turnNumber < 1) {
    return 1
  }
  return turnNumber
}

const normalizeActivePlayerIndex = (activePlayerIndex, playerCount) => {
  if (playerCount <= 0) {
    return 0
  }
  if (!Number.isInteger(activePlayerIndex) || activePlayerIndex < 0) {
    return 0
  }
  return activePlayerIndex % playerCount
}

const getPlayerKey = (player, index) => {
  if (player?.id != null) {
    return String(player.id)
  }
  return `player-${index}`
}

const getMoveHistory = (game) => (Array.isArray(game?.moveHistory) ? game.moveHistory : [])

const generateMoveId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `move-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

function App() {
  const [resumeErrors, setResumeErrors] = useState({})
  const [deleteErrors, setDeleteErrors] = useState({})
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isAdvancingTurn, setIsAdvancingTurn] = useState(false)
  const [turnPlan, setTurnPlan] = useState(EMPTY_TURN_PLAN)
  const [entrySource, setEntrySource] = useState('none')
  const [playScreen, setPlayScreen] = useState('welcome')
  const [wizardDraft, setWizardDraft] = useState(null)
  const [routeRequest, setRouteRequest] = useState(() => parseAppRoute(window.location.pathname))
  const [hasHydratedRoute, setHasHydratedRoute] = useState(false)
  const newGameCardRef = useRef(null)
  const newGameButtonRef = useRef(null)
  const { state, openCreate, openSession, openPlay, openDelete, openHistory, closeHistory, closeAll } =
    useModalState()
  const { view, activeGame, activeGameMode, pendingDelete, historyPlayer } = state
  const { games, isLoading, fetchError, loadGames, createGame, deleteGame, updateGame, newGameId, setNewGameId } =
    useGames()
  const previousViewRef = useRef(view)
  const currentActiveGame =
    activeGame?.id != null ? games.find((game) => game.id === String(activeGame.id)) || activeGame : activeGame
  const currentPlayers = Array.isArray(currentActiveGame?.players) ? currentActiveGame.players : []
  const currentPlayerCount = currentPlayers.length
  const currentActivePlayerIndex = normalizeActivePlayerIndex(currentActiveGame?.activePlayerIndex, currentPlayerCount)
  const currentActivePlayer = currentPlayers[currentActivePlayerIndex] || null
  const currentActivePlayerKey = currentActivePlayer ? getPlayerKey(currentActivePlayer, currentActivePlayerIndex) : null
  const historyEntries = historyPlayer
    ? getMoveHistory(currentActiveGame)
        .filter((entry) => entry.playerId === historyPlayer.playerId)
        .sort((left, right) => right.createdAt - left.createdAt)
    : []

  const buildTurnPlanForGame = useCallback((gameOverride = currentActiveGame) => {
    const game = gameOverride
    const players = Array.isArray(game?.players) ? game.players : []
    if (!game || players.length === 0) {
      return EMPTY_TURN_PLAN
    }

    const activePlayerIndex = normalizeActivePlayerIndex(game.activePlayerIndex, players.length)
    const activePlayer = players[activePlayerIndex] || null
    if (!activePlayer) {
      return EMPTY_TURN_PLAN
    }

    const nextActionMenu = getAvailableTurnActions({
      game,
      player: activePlayer,
      turnNumber: normalizeTurnNumber(game.turnNumber),
    })

    return {
      stage: 'brief',
      actionPoints: nextActionMenu.actionPoints,
      remainingActionPoints: nextActionMenu.actionPoints,
      selectedActions: [],
      curatedActions: nextActionMenu.curatedActions,
      issueActions: nextActionMenu.issueActions,
      explanation: nextActionMenu.explanation,
      brief: buildTurnBrief({
        game,
        player: activePlayer,
        turnNumber: normalizeTurnNumber(game.turnNumber),
      }),
      reveal: buildTurnReveal({
        game,
        player: activePlayer,
        turnNumber: normalizeTurnNumber(game.turnNumber),
      }),
    }
  }, [currentActiveGame])

  const clearDebugState = useCallback(() => {
    setEntrySource('none')
    setWizardDraft(null)
  }, [])

  const handleCreateClick = () => {
    openCreate()
    setCreateError('')
    clearDebugState()
    setPlayScreen('welcome')
  }

  const handleBackClick = () => {
    closeAll()
    setCreateError('')
    setIsCreating(false)
    clearDebugState()
    setPlayScreen('welcome')
  }

  const handleWizardStatusChange = useCallback((nextStatus) => {
    setWizardDraft(nextStatus ? toJsonSafe(nextStatus) : null)
  }, [])

  const handleCreateGame = async (wizardPayload) => {
    const payloadName = wizardPayload?.name?.trim() || ''
    const payloadPlayers = Array.isArray(wizardPayload?.players) ? wizardPayload.players : []
    const modifierContext = wizardPayload?.modifierContext || createDefaultModifierContext()
    if (!payloadName || payloadPlayers.length < 2) {
      setCreateError('Add at least two players before starting.')
      return
    }

    setIsCreating(true)
    setCreateError('')

    try {
      const timestamp = Date.now()
      const gameSeed =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `seed-${timestamp}-${Math.floor(Math.random() * 100000)}`
      const newGame = {
        name: payloadName,
        status: 'active',
        seed: gameSeed,
        modifierContext,
        players: payloadPlayers.map((player) =>
          initializePlayerState({
            ...player,
            name: player.name.trim(),
          }, modifierContext),
        ),
        turnNumber: 1,
        activePlayerIndex: 0,
        moveHistory: [],
        lastUpdated: timestamp,
        createdAt: timestamp,
        resumable: true,
      }
      const createdGame = await createGame(newGame)
      setEntrySource('create')
      setPlayScreen('welcome')
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
    setPlayScreen('welcome')
    setWizardDraft(null)
    openPlay(game)
  }

  const handlePlayBegin = useCallback(() => {
    setPlayScreen('turn')
  }, [])

  const handlePlayPlaceholderAction = useCallback(() => {}, [])

  const handleRecordMoveAndAdvanceTurn = useCallback(
    async (selectedActions = []) => {
      if (isAdvancingTurn || !currentActiveGame) {
        return
      }

      const players = Array.isArray(currentActiveGame.players) ? currentActiveGame.players : []
      if (players.length === 0) {
        return
      }

      const activePlayerIndex = normalizeActivePlayerIndex(currentActiveGame.activePlayerIndex, players.length)
      const activePlayer = players[activePlayerIndex] || null
      if (!activePlayer) {
        return
      }

      const currentTurnNumber = normalizeTurnNumber(currentActiveGame.turnNumber)
      const nextPlayerIndex = (activePlayerIndex + 1) % players.length
      const nextTurnNumber = nextPlayerIndex === 0 ? currentTurnNumber + 1 : currentTurnNumber
      const timestamp = Date.now()
      const resolvedTurn = resolvePlayerTurn({
        game: currentActiveGame,
        player: activePlayer,
        selectedActions,
        turnNumber: currentTurnNumber,
        playerName: activePlayer.name?.trim() || `Player ${activePlayerIndex + 1}`,
      })
      const nextPlayers = players.map((player, index) =>
        index === activePlayerIndex ? resolvedTurn.player : player,
      )
      const nextMoveHistory = [
        ...getMoveHistory(currentActiveGame),
        {
          id: generateMoveId(),
          playerId: getPlayerKey(activePlayer, activePlayerIndex),
          playerName: activePlayer.name?.trim() || `Player ${activePlayerIndex + 1}`,
          turnNumber: currentTurnNumber,
          actionType: resolvedTurn.actionType,
          actionLabel: resolvedTurn.actionLabel,
          statDelta: resolvedTurn.totalDelta,
          turnLog: resolvedTurn.turnLog,
          actionsTaken: resolvedTurn.turnLog.actionsTaken,
          createdAt: timestamp,
        },
      ]

      setIsAdvancingTurn(true)

      try {
        const updatedGame = await updateGame(currentActiveGame.id, {
          ...currentActiveGame,
          players: nextPlayers,
          turnNumber: nextTurnNumber,
          activePlayerIndex: nextPlayerIndex,
          moveHistory: nextMoveHistory,
          lastUpdated: timestamp,
        })
        openPlay(updatedGame)
        const nextTurnPlan = buildTurnPlanForGame(updatedGame)
        setTurnPlan({
          ...nextTurnPlan,
          stage: 'handoff',
        })
      } finally {
        setIsAdvancingTurn(false)
      }
    },
    [isAdvancingTurn, currentActiveGame, updateGame, openPlay, buildTurnPlanForGame],
  )

  const handleBeginTurn = useCallback(() => {
    if (isAdvancingTurn) {
      return
    }
    setTurnPlan((current) => ({
      ...current,
      stage: 'action',
    }))
  }, [isAdvancingTurn])

  const handleRevealNextTurn = useCallback(() => {
    setTurnPlan((current) => ({
      ...current,
      stage: 'turn_reveal',
    }))
  }, [])

  const handleContinueToBrief = useCallback(() => {
    setTurnPlan((current) => ({
      ...current,
      stage: 'brief',
    }))
  }, [])

  const handleToggleAction = useCallback((actionId) => {
    setTurnPlan((current) => {
      const selectedActions = Array.isArray(current.selectedActions) ? current.selectedActions : []
      const curatedActions = [...(current.curatedActions || []), ...(current.issueActions || [])]
      const action = curatedActions.find((entry) => entry.id === actionId)
      if (!action) {
        return current
      }

      if (selectedActions.includes(actionId)) {
        return {
          ...current,
          selectedActions: selectedActions.filter((entry) => entry !== actionId),
          remainingActionPoints: Math.min(current.actionPoints, current.remainingActionPoints + action.apCost),
        }
      }

      if (action.apCost > current.remainingActionPoints) {
        return current
      }

      return {
        ...current,
        selectedActions: [...selectedActions, actionId],
        remainingActionPoints: current.remainingActionPoints - action.apCost,
      }
    })
  }, [])

  const handleResetTurnPlan = useCallback(() => {
    setTurnPlan(buildTurnPlanForGame())
  }, [buildTurnPlanForGame])

  const handleEndTurn = useCallback(() => {
    return handleRecordMoveAndAdvanceTurn(turnPlan.selectedActions)
  }, [handleRecordMoveAndAdvanceTurn, turnPlan.selectedActions])

  const handleOpenHistory = useCallback(() => {
    if (isAdvancingTurn || !currentActiveGame) {
      return
    }
    if (turnPlan.stage === 'handoff' || turnPlan.stage === 'turn_reveal') {
      return
    }
    if (!currentActivePlayerKey) {
      return
    }
    openHistory({
      playerId: currentActivePlayerKey,
      playerName: currentActivePlayer?.name?.trim() || `Player ${currentActivePlayerIndex + 1}`,
    })
  }, [isAdvancingTurn, currentActiveGame, turnPlan.stage, currentActivePlayer, currentActivePlayerIndex, currentActivePlayerKey, openHistory])

  const handleViewResults = (game) => {
    openSession(game, 'results')
  }

  useEffect(() => {
    if (view !== 'play' || playScreen !== 'turn') {
      return
    }
    const currentTurn = normalizeTurnNumber(currentActiveGame?.turnNumber)
    const currentPlayerName = currentActivePlayer?.name?.trim() || 'Player'
    const planMatchesCurrentTurn =
      turnPlan.reveal?.turnNumber === currentTurn && turnPlan.reveal?.playerName === currentPlayerName

    if (planMatchesCurrentTurn) {
      return
    }
    setTurnPlan(buildTurnPlanForGame())
  }, [
    view,
    playScreen,
    turnPlan.reveal,
    buildTurnPlanForGame,
    currentActiveGame?.id,
    currentActivePlayer,
    currentActivePlayerKey,
    currentActiveGame?.turnNumber,
  ])

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
      setPlayScreen('welcome')
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
      setPlayScreen('welcome')
      setRouteRequest(null)
      setHasHydratedRoute(true)
      return
    }

    setEntrySource('route')
    setPlayScreen('welcome')
    setWizardDraft(null)
    openPlay(targetGame)

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
    if (view !== 'session' && !pendingDelete && !historyPlayer) {
      return
    }

    const handleKeyDown = (event) => {
      if (isCreating) {
        return
      }
      if (event.key === 'Escape') {
        if (historyPlayer) {
          closeHistory()
          return
        }
        closeAll()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, pendingDelete, historyPlayer, isCreating, closeHistory, closeAll])

  useEffect(() => {
    if (previousViewRef.current === 'create' && view === 'home') {
      window.requestAnimationFrame(() => newGameButtonRef.current?.focus())
    }
    previousViewRef.current = view
  }, [view])

  useEffect(() => {
    if (view !== 'play') {
      setPlayScreen('welcome')
      setTurnPlan(EMPTY_TURN_PLAN)
    }
  }, [view])

  const getLifeStatus = useCallback(() => {
    const { storageMode, storageKey, allGames } = getGameStorageDebugSnapshot(games)
    const activeGameId = currentActiveGame?.id ? String(currentActiveGame.id) : null
    const persistedGame = activeGameId ? allGames.find((game) => game.id === activeGameId) || null : null
    const playerCount = Array.isArray(currentActiveGame?.players) ? currentActiveGame.players.length : 0

    return toJsonSafe({
      view,
      activeGameMode,
      entrySource,
      playScreen,
      playStage: turnPlan.stage,
      activeGameId,
      activeGame: currentActiveGame,
      turnNumber: normalizeTurnNumber(currentActiveGame?.turnNumber),
      activePlayerIndex: normalizeActivePlayerIndex(currentActiveGame?.activePlayerIndex, playerCount),
      isHistoryOpen: Boolean(historyPlayer),
      historyPlayerId: historyPlayer?.playerId || null,
      persistedGame,
      storageMode,
      storageKey,
      allGames,
      wizardDraft,
      turnPlan,
    }, {})
  }, [view, activeGameMode, entrySource, playScreen, turnPlan, currentActiveGame, games, wizardDraft, historyPlayer])

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
      if (historyPlayer) {
        closeHistory()
        return
      }
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
      historyPlayer={historyPlayer}
      historyEntries={historyEntries}
      onBackdropClick={handleBackdropClick}
      onCloseAll={handleBackClick}
      onHistoryClose={closeHistory}
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

  const isModalOpen = view === 'create' || view === 'session' || Boolean(pendingDelete) || Boolean(historyPlayer)

  const pageShellClassName = view === 'play' && playScreen === 'turn' ? 'page-play' : ''

  return (
    <PageShell isBlurred={isModalOpen} modals={modals} className={pageShellClassName}>
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
        playScreen === 'welcome' ? (
          <WelcomeToLifePage game={currentActiveGame} onBegin={handlePlayBegin} />
        ) : (
          <PlayGamePage
            game={currentActiveGame}
            isAdvancingTurn={isAdvancingTurn}
            turnPlan={turnPlan}
            onContinueToBrief={handleContinueToBrief}
            onBeginTurn={handleBeginTurn}
            onRevealNextTurn={handleRevealNextTurn}
            onToggleAction={handleToggleAction}
            onEndTurn={handleEndTurn}
            onResetTurnPlan={handleResetTurnPlan}
            onNextPlayer={handlePlayPlaceholderAction}
            onPreviousPlayer={handlePlayPlaceholderAction}
            onSeeHistory={handleOpenHistory}
          />
        )
      ) : null}
    </PageShell>
  )
}

export default App
