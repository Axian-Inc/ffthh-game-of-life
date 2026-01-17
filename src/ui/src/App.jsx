import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [view, setView] = useState('home')
  const [games, setGames] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [nextId, setNextId] = useState(4)
  const [activeGame, setActiveGame] = useState(null)
  const [activeGameMode, setActiveGameMode] = useState('resume')
  const [resumeErrors, setResumeErrors] = useState({})
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleteErrors, setDeleteErrors] = useState({})
  const [gameName, setGameName] = useState('')
  const [gameNameTouched, setGameNameTouched] = useState(false)
  const [gameType, setGameType] = useState('classic')
  const [scoringMode, setScoringMode] = useState('standard')
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newGameId, setNewGameId] = useState(null)
  const createDefaultPlayers = () => [
    { id: 1, name: 'Player 1', avatar: '🧩' },
    { id: 2, name: 'Player 2', avatar: '⚡' },
  ]
  const [players, setPlayers] = useState(createDefaultPlayers)
  const [nextPlayerId, setNextPlayerId] = useState(3)
  const [playerTouched, setPlayerTouched] = useState({})
  const newGameCardRef = useRef(null)

  const trimmedGameName = gameName.trim()
  const maxGameNameLength = 60
  const isGameNameTooLong = trimmedGameName.length > maxGameNameLength
  const isGameNameValid = trimmedGameName.length > 0 && !isGameNameTooLong
  const maxPlayerNameLength = 24
  const minPlayers = 2
  const normalizedNames = players.map((player) => player.name.trim().toLowerCase())
  const nameCounts = normalizedNames.reduce((counts, name) => {
    if (!name) {
      return counts
    }
    counts[name] = (counts[name] || 0) + 1
    return counts
  }, {})
  const getPlayerError = (player) => {
    const trimmedName = player.name.trim()
    if (!trimmedName) {
      return 'Player name is required.'
    }
    if (trimmedName.length > maxPlayerNameLength) {
      return `Name must be ${maxPlayerNameLength} characters or fewer.`
    }
    if (nameCounts[trimmedName.toLowerCase()] > 1) {
      return 'Names must be unique.'
    }
    return ''
  }
  const arePlayersValid =
    players.length >= minPlayers && players.every((player) => !getPlayerError(player))
  const hasPlayerValidation = Object.values(playerTouched).some(Boolean)

  const avatarOptions = ['🧩', '⚡', '🌿', '🔥', '💫', '🪐', '🧠', '🎯', '🛰️', '🌊']
  const getRandomAvatar = (currentAvatar) => {
    const available = avatarOptions.filter((avatar) => avatar !== currentAvatar)
    return available[Math.floor(Math.random() * available.length)] || avatarOptions[0]
  }

  const loadGames = ({ shouldFail = false } = {}) => {
    setIsLoading(true)
    setFetchError('')

    window.setTimeout(() => {
      if (shouldFail) {
        setFetchError('Unable to load games. Check your connection and try again.')
        setIsLoading(false)
        return
      }

      setGames([
        {
          id: 1,
          name: 'Family Game Night',
          status: 'active',
          players: [
            { name: 'Jules', avatar: '🧩' },
            { name: 'Seth', avatar: '⚡' },
            { name: 'Ari', avatar: '🌿' },
          ],
          lastUpdated: Date.now() - 60 * 60 * 1000,
          createdAt: Date.now() - 5 * 60 * 60 * 1000,
          resumable: true,
        },
        {
          id: 2,
          name: 'Weekend Tournament',
          status: 'paused',
          players: [
            { name: 'Mira', avatar: '🔥' },
            { name: 'Quinn', avatar: '💫' },
            { name: 'Leo', avatar: '🪐' },
            { name: 'Parker', avatar: '🧠' },
            { name: 'Vera', avatar: '🎯' },
            { name: 'Eli', avatar: '🛰️' },
          ],
          lastUpdated: Date.now() - 3 * 60 * 60 * 1000,
          createdAt: Date.now() - 7 * 60 * 60 * 1000,
          resumable: false,
        },
        {
          id: 3,
          name: 'Ultra-Long Experimental Universe Name That Keeps Going',
          status: 'completed',
          players: [
            { name: 'Cora', avatar: '🌊' },
            { name: 'Rafi', avatar: '🧩' },
          ],
          lastUpdated: Date.now() - 24 * 60 * 60 * 1000,
          createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
          resumable: false,
        },
      ])
      setIsLoading(false)
    }, 900)
  }

  const handleCreateClick = () => {
    setView('create')
    setGameNameTouched(false)
    setPlayerTouched({})
    setCreateError('')
  }

  const handleBackClick = () => {
    setView('home')
    setActiveGame(null)
    setActiveGameMode('resume')
    setGameName('')
    setGameNameTouched(false)
    setPlayers(createDefaultPlayers())
    setNextPlayerId(3)
    setPlayerTouched({})
    setCreateError('')
    setIsCreating(false)
  }

  const handleCreateGame = () => {
    if (!isGameNameValid || !arePlayersValid) {
      setGameNameTouched(true)
      setPlayerTouched((current) => {
        const updated = { ...current }
        players.forEach((player) => {
          updated[player.id] = true
        })
        return updated
      })
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
      setGames((current) => [newGame, ...current])
      setNextId((current) => current + 1)
      setView('home')
      setNewGameId(newGame.id)
      setGameName('')
      setGameNameTouched(false)
      setPlayers(createDefaultPlayers())
      setNextPlayerId(3)
      setPlayerTouched({})
      setIsCreating(false)
    }, 700)
  }

  const handleDeleteGame = (gameId) => {
    setGames((current) => current.filter((game) => game.id !== gameId))
  }

  const handleDeleteRequest = (game) => {
    setPendingDelete(game)
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
    handleDeleteGame(pendingDelete.id)
    setPendingDelete(null)
  }

  const handleDeleteCancel = () => {
    setPendingDelete(null)
  }

  const handleGameNameChange = (event) => {
    setGameName(event.target.value)
  }

  const handleGameNameBlur = () => {
    setGameNameTouched(true)
  }

  const handleAddPlayer = () => {
    setPlayers((current) => [
      ...current,
      {
        id: nextPlayerId,
        name: '',
        avatar: getRandomAvatar(),
      },
    ])
    setNextPlayerId((current) => current + 1)
  }

  const handleRemovePlayer = (playerId) => {
    setPlayers((current) => current.filter((player) => player.id !== playerId))
    setPlayerTouched((current) => {
      if (!current[playerId]) {
        return current
      }
      const { [playerId]: _, ...rest } = current
      return rest
    })
  }

  const handlePlayerNameChange = (playerId, value) => {
    setPlayers((current) =>
      current.map((player) =>
        player.id === playerId ? { ...player, name: value } : player,
      ),
    )
  }

  const handlePlayerBlur = (playerId) => {
    setPlayerTouched((current) => ({ ...current, [playerId]: true }))
  }

  const handleRandomizeAvatar = (playerId) => {
    setPlayers((current) =>
      current.map((player) =>
        player.id === playerId
          ? { ...player, avatar: getRandomAvatar(player.avatar) }
          : player,
      ),
    )
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
    setActiveGameMode('resume')
    setActiveGame(game)
    setView('session')
  }

  const handleViewResults = (game) => {
    setActiveGameMode('results')
    setActiveGame(game)
    setView('session')
  }

  const formatRelativeTime = (timestamp, now) => {
    const seconds = Math.floor((now - timestamp) / 1000)

    if (seconds < 60) {
      return 'just now'
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `about ${minutes} minute${minutes === 1 ? '' : 's'} ago`
    }

    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `about ${hours} hour${hours === 1 ? '' : 's'} ago`
    }

    const days = Math.floor(hours / 24)
    return `about ${days} day${days === 1 ? '' : 's'} ago`
  }

  const renderAvatars = (players, maxVisible = 4) => {
    const visible = players.slice(0, maxVisible)
    const overflow = players.length - visible.length

    return (
      <div className="avatar-row" aria-label={`${players.length} players`}>
        {visible.map((player, index) => (
          <span className="avatar" key={`player-${index}`} aria-hidden="true">
            {typeof player === 'string' ? player : player.avatar}
          </span>
        ))}
        {overflow > 0 ? (
          <span className="avatar avatar-overflow" aria-hidden="true">
            +{overflow}
          </span>
        ) : null}
      </div>
    )
  }

  useEffect(() => {
    loadGames()
  }, [])

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
        setView('home')
        setActiveGame(null)
        setActiveGameMode('resume')
        setPendingDelete(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, pendingDelete, isCreating])

  const handleBackdropClick = (event) => {
    if (isCreating) {
      return
    }
    if (event.target === event.currentTarget) {
      setView('home')
      setActiveGame(null)
      setActiveGameMode('resume')
      setPendingDelete(null)
    }
  }

  const now = Date.now()

  return (
    <div className="page">
      <div className={`layout ${view !== 'home' || pendingDelete ? 'is-blurred' : ''}`}>
        <header className="hero">
          <div className="app-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="img">
              <defs>
                <linearGradient id="pulse" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f76b1c" />
                  <stop offset="100%" stopColor="#f3d35b" />
                </linearGradient>
              </defs>
              <rect
                x="8"
                y="8"
                width="48"
                height="48"
                rx="14"
                fill="url(#pulse)"
              />
              <path
                d="M21 34h6v-6h-6v6zm8 8h6v-6h-6v6zm0-16h6v-6h-6v6zm8 8h6v-6h-6v6z"
                fill="#1b1b1b"
              />
            </svg>
          </div>
          <div className="hero-copy">
            <p className="eyebrow">Game Hub</p>
            <h1>Game of LIFE</h1>
            <p className="tagline">
              Watch tiny cells spark, survive, and evolve as you explore Conway’s
              classic universe of simple rules and endless outcomes.
            </p>
            <button className="primary-action" type="button" onClick={handleCreateClick}>
              New Game
            </button>
          </div>
        </header>
        <section className="game-list" aria-label="Game list">
          <div className="game-list-header">
            <div className="game-title">
              <span className="game-title-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path
                    d="M7 4h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <h2>Your Games</h2>
            </div>
            <span
              className="game-count"
              aria-label={isLoading ? 'Loading games' : `${games.length} games`}
            >
              {isLoading ? '...' : games.length}
            </span>
          </div>
          {fetchError ? (
            <div className="game-error" role="alert">
              <p>{fetchError}</p>
              <button className="primary-action" type="button" onClick={() => loadGames()}>
                Retry
              </button>
            </div>
          ) : (
            <ul className="game-items">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <li key={`skeleton-${index}`}>
                      <div className="game-card skeleton">
                        <div className="skeleton-line short" />
                        <div className="skeleton-line" />
                        <div className="skeleton-line" />
                      </div>
                    </li>
                  ))
                : games.map((game) => (
                    <li key={game.id}>
                      <div
                        className="game-card"
                        tabIndex={game.id === newGameId ? -1 : undefined}
                        ref={game.id === newGameId ? newGameCardRef : undefined}
                      >
                        <div className="game-card-header">
                          <h3>{game.name}</h3>
                          <span className={`status-pill status-${game.status}`}>
                            {game.status}
                          </span>
                        </div>
                        <div className="game-card-meta">
                          <span>{game.players.length} players</span>
                          <span>{formatRelativeTime(game.lastUpdated, now)}</span>
                        </div>
                        {renderAvatars(game.players)}
                        <div className="game-card-actions">
                          <button
                            className="primary-action"
                            type="button"
                            onClick={() =>
                              game.status === 'completed'
                                ? handleViewResults(game)
                                : handleResumeGame(game)
                            }
                            disabled={isLoading || game.status === 'paused'}
                          >
                            {game.status === 'completed' ? 'View results' : 'Resume'}
                          </button>
                          <button
                            className="secondary-action"
                            type="button"
                            onClick={() => handleDeleteRequest(game)}
                            aria-label={`Delete ${game.name}`}
                            disabled={isLoading}
                          >
                            <span aria-hidden="true">
                              <svg viewBox="0 0 24 24" role="img">
                                <path
                                  d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                          </button>
                        </div>
                        {resumeErrors[game.id] ? (
                          <p className="resume-error" role="alert">
                            {resumeErrors[game.id]}
                          </p>
                        ) : null}
                        {deleteErrors[game.id] ? (
                          <p className="delete-error" role="alert">
                            {deleteErrors[game.id]}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
            </ul>
          )}
        </section>
      </div>
      {view === 'create' ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={handleBackdropClick}
        >
          <div className="modal-card">
            <div className="modal-header">
              <p className="eyebrow">Create Game</p>
              <h2>Build a new universe</h2>
            </div>
            <form className="create-form" onSubmit={(event) => event.preventDefault()}>
              <label className="field">
                <span>Game name</span>
                <input
                  type="text"
                  placeholder="Family Game Night"
                  maxLength={maxGameNameLength}
                  value={gameName}
                  onChange={handleGameNameChange}
                  onBlur={handleGameNameBlur}
                  aria-invalid={!isGameNameValid && gameNameTouched}
                  disabled={isCreating}
                />
                {!isGameNameValid && gameNameTouched ? (
                  <span className="field-error">
                    {isGameNameTooLong
                      ? `Name must be ${maxGameNameLength} characters or fewer.`
                      : 'Game name is required.'}
                  </span>
                ) : null}
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Game type</span>
                  <select
                    value={gameType}
                    onChange={(event) => setGameType(event.target.value)}
                    disabled={isCreating}
                  >
                    <option value="classic">Classic</option>
                    <option value="highlife">HighLife</option>
                    <option value="seeds">Seeds</option>
                  </select>
                </label>
                <label className="field">
                  <span>Scoring mode</span>
                  <select
                    value={scoringMode}
                    onChange={(event) => setScoringMode(event.target.value)}
                    disabled={isCreating}
                  >
                    <option value="standard">Standard</option>
                    <option value="speed">Speed</option>
                    <option value="endless">Endless</option>
                  </select>
                </label>
              </div>
              <div className="players-section">
                <div className="players-header">
                  <div>
                    <span>Players</span>
                    <p className="players-summary">
                      {players.length} players (minimum {minPlayers})
                    </p>
                  </div>
                  <button
                    className="secondary-action"
                    type="button"
                    onClick={handleAddPlayer}
                    disabled={isCreating}
                  >
                    Add player
                  </button>
                </div>
                <div className="players-list">
                  {players.map((player) => {
                    const playerError = getPlayerError(player)
                    const showError = playerTouched[player.id] && playerError
                    return (
                      <div className="player-row" key={player.id}>
                        <div className="player-avatar">
                          <span aria-hidden="true">{player.avatar}</span>
                          <button
                            className="icon-button"
                            type="button"
                            onClick={() => handleRandomizeAvatar(player.id)}
                            aria-label={`Randomize avatar for ${player.name || 'player'}`}
                            disabled={isCreating}
                          >
                            🎲
                          </button>
                        </div>
                        <label className="field player-field">
                          <span>Player name</span>
                          <input
                            type="text"
                            placeholder="Player name"
                            maxLength={maxPlayerNameLength}
                            value={player.name}
                            onChange={(event) =>
                              handlePlayerNameChange(player.id, event.target.value)
                            }
                            onBlur={() => handlePlayerBlur(player.id)}
                            aria-invalid={Boolean(showError)}
                            disabled={isCreating}
                          />
                          {showError ? <span className="field-error">{playerError}</span> : null}
                        </label>
                        <button
                          className="icon-button remove"
                          type="button"
                          onClick={() => handleRemovePlayer(player.id)}
                          aria-label={`Remove ${player.name || 'player'}`}
                          disabled={players.length <= minPlayers || isCreating}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
                {!arePlayersValid && hasPlayerValidation ? (
                  <p className="field-error">
                    Add at least {minPlayers} players with unique names.
                  </p>
                ) : null}
              </div>
            </form>
            {createError ? (
              <p className="field-error" role="alert">
                {createError}
              </p>
            ) : null}
            <div className="modal-actions">
              <button
                className="secondary-action"
                type="button"
                onClick={handleBackClick}
                disabled={isCreating}
              >
                Back to home
              </button>
              <button
                className="primary-action"
                type="button"
                onClick={handleCreateGame}
                disabled={!isGameNameValid || !arePlayersValid || isCreating}
              >
                {isCreating ? 'Creating...' : 'Start setup'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {view === 'session' && activeGame ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={handleBackdropClick}
        >
          <div className="modal-card">
            <div className="modal-header">
              <p className="eyebrow">
                {activeGameMode === 'results' ? 'Game Results' : 'Resume Game'}
              </p>
              <h2>{activeGame.name}</h2>
            </div>
            <p className="tagline">
              {activeGameMode === 'results'
                ? `Reviewing the outcome for game ID ${activeGame.id}. Results view is a placeholder.`
                : `Loading the last saved state for game ID ${activeGame.id}. This is a placeholder for the session view.`}
            </p>
            <div className="modal-actions">
              <button className="secondary-action" type="button" onClick={handleBackClick}>
                Back to home
              </button>
              {activeGameMode === 'results' ? (
                <button className="primary-action" type="button" onClick={handleBackClick}>
                  Start new game
                </button>
              ) : (
                <button className="primary-action" type="button">
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
      {pendingDelete ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={handleBackdropClick}
        >
          <div className="modal-card">
            <div className="modal-header">
              <p className="eyebrow">Delete Game</p>
              <h2>Remove “{pendingDelete.name}”?</h2>
            </div>
            <p className="tagline">
              This will permanently remove the game session and its history.
            </p>
            <div className="modal-actions">
              <button className="secondary-action" type="button" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="primary-action" type="button" onClick={handleDeleteConfirm}>
                Delete game
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
