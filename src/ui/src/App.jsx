import { useEffect, useRef, useState } from 'react'
import './App.css'
import PageShell from './components/layout/PageShell'
import Hero from './components/layout/Hero'
import GameListSection from './components/layout/GameListSection'
import GameErrorState from './components/games/GameErrorState'
import GameGrid from './components/games/GameGrid'
import ModalManager from './components/modals/ModalManager'
import useGames from './hooks/useGames'
import useCreateGameForm from './hooks/useCreateGameForm'
import useModalState from './hooks/useModalState'

function App() {
  const [resumeErrors, setResumeErrors] = useState({})
  const [deleteErrors, setDeleteErrors] = useState({})
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const newGameCardRef = useRef(null)
  const newGameButtonRef = useRef(null)
  const { state, openCreate, openSession, openDelete, closeAll } = useModalState()
  const { view, activeGame, activeGameMode, pendingDelete } = state
  const {
    games,
    isLoading,
    fetchError,
    loadGames,
    addGame,
    deleteGame,
    nextId,
    newGameId,
    setNewGameId,
  } = useGames()
  const {
    gameName,
    setGameName,
    gameNameTouched,
    setGameNameTouched,
    gameType,
    setGameType,
    scoringMode,
    setScoringMode,
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
    randomizeDraftAvatar,
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
    setIsCreating(false)
  }

  const handleCreateGame = () => {
    if (!isGameNameValid || !arePlayersValid) {
      markAllTouched()
      return
    }
    setIsCreating(true)
    setCreateError('')

    window.setTimeout(() => {
      const shouldFail = trimmedGameName.toLowerCase().includes('fail')
      if (shouldFail) {
        setCreateError('We could not create that game yet. Please try again.')
        setIsCreating(false)
        return
      }

      const timestamp = Date.now()
      const newGame = {
        id: nextId,
        name: trimmedGameName,
        status: 'active',
        players: players.map((player) => ({
          ...player,
          name: player.name.trim(),
        })),
        lastUpdated: timestamp,
        createdAt: timestamp,
        resumable: true,
        type: gameType,
        scoring: scoringMode,
      }
      addGame(newGame)
      closeAll()
      resetForm()
      setIsCreating(false)
    }, 700)
  }

  const handleAddPlayer = () => {
    addPlayer()
  }

  const handleDeleteRequest = (game) => {
    openDelete(game)
  }

  const handleDeleteConfirm = () => {
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
    deleteGame(pendingDelete.id)
    closeAll()
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
    openSession(game, 'resume')
  }

  const handleViewResults = (game) => {
    openSession(game, 'results')
  }

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
        gameType,
        scoringMode,
        onGameTypeChange: (event) => setGameType(event.target.value),
        onScoringModeChange: (event) => setScoringMode(event.target.value),
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
        onDraftShuffle: randomizeDraftAvatar,
        createError,
        isCreating,
      }}
    />
  )

  return (
    <PageShell isBlurred={view !== 'home' || pendingDelete} modals={modals}>
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
    </PageShell>
  )
}

export default App
