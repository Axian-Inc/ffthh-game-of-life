import { useEffect, useMemo, useState } from 'react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import {
  formatMoney,
  getActionCatalog,
  getCurrentPlayer,
  getUpcomingPlayer,
  initializeGameState,
  resolveTurn,
} from '../../utils/gameSimulation'

const PlayGamePage = ({ game, onHome, onGameUpdate = async () => null }) => {
  const initialGameState = useMemo(() => initializeGameState(game), [game])
  const [localGame, setLocalGame] = useState(initialGameState)
  const initializedGame = localGame
  const actionCatalog = useMemo(() => getActionCatalog(initializedGame), [initializedGame])
  const [playStage, setPlayStage] = useState(initialGameState?.phase || 'turn-start')
  const [selectedActionId, setSelectedActionId] = useState('skip-action')
  const [relocationTarget, setRelocationTarget] = useState('')
  const [latestResolution, setLatestResolution] = useState(
    initializedGame?.turnHistory?.[initializedGame.turnHistory.length - 1] || null,
  )
  const [isSavingTurn, setIsSavingTurn] = useState(false)
  const [isAdvancingTurn, setIsAdvancingTurn] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    setLocalGame(initialGameState)
    setPlayStage(initialGameState?.phase || 'turn-start')
    setSelectedActionId('skip-action')
    setRelocationTarget('')
    setLatestResolution(initialGameState?.turnHistory?.[initialGameState.turnHistory.length - 1] || null)
    setSaveError('')
  }, [initialGameState])

  useEffect(() => {
    setPlayStage(initializedGame?.phase || 'turn-start')
    setSelectedActionId('skip-action')
    setRelocationTarget('')
    setLatestResolution(initializedGame?.turnHistory?.[initializedGame.turnHistory.length - 1] || null)
    setSaveError('')
  }, [initializedGame?.id])

  const currentPlayer = initializedGame ? getCurrentPlayer(initializedGame) : null

  if (!initializedGame || !currentPlayer) {
    return null
  }

  const passControlPlayer = getUpcomingPlayer(initializedGame)
  const summaryPlayer =
    playStage === 'turn-summary' && latestResolution?.playerId
      ? initializedGame.players.find((player) => player.id === latestResolution.playerId) || currentPlayer
      : currentPlayer
  const displayPlayer = playStage === 'turn-summary' ? summaryPlayer : currentPlayer
  const displaySeatIndex = Math.max(
    0,
    initializedGame.players.findIndex((player) => player.id === displayPlayer.id),
  )

  const selectedAction =
    actionCatalog.find((action) => action.id === selectedActionId) || actionCatalog.find((action) => action.id === 'skip-action')
  const canResolveTurn =
    Boolean(selectedAction) &&
    selectedAction.isAvailable &&
    (!selectedAction.requiresTarget || Boolean(relocationTarget))

  const handleActionChange = (actionId) => {
    setSelectedActionId(actionId)
    setSaveError('')
    const action = actionCatalog.find((candidate) => candidate.id === actionId)
    if (!action?.requiresTarget) {
      setRelocationTarget('')
      return
    }
    if (!action.targetOptions.some((option) => option.value === relocationTarget)) {
      setRelocationTarget(action.targetOptions[0]?.value || '')
    }
  }

  const handleTakeTurn = async () => {
    if (!canResolveTurn || isSavingTurn) {
      return
    }

    setIsSavingTurn(true)
    setSaveError('')

    try {
      const { updatedGame, turnResolution } = resolveTurn(initializedGame, {
        actionId: selectedAction.id,
        targetCityId: relocationTarget || undefined,
      })
      const persistedGame = (await onGameUpdate(updatedGame)) || updatedGame
      const nextGameState = initializeGameState(persistedGame)
      setLocalGame(nextGameState)
      setLatestResolution(turnResolution)
      setPlayStage('turn-summary')
      setSelectedActionId('skip-action')
      setRelocationTarget('')
      if (nextGameState?.turnHistory?.length) {
        setLatestResolution(nextGameState.turnHistory[nextGameState.turnHistory.length - 1])
      }
    } catch {
      setSaveError('We could not save that turn yet. Please try again.')
    } finally {
      setIsSavingTurn(false)
    }
  }

  const handleStartNextTurn = async () => {
    if (isAdvancingTurn) {
      return
    }

    setIsAdvancingTurn(true)
    setSaveError('')

    try {
      const persistedGame =
        (await onGameUpdate({
          ...initializedGame,
          phase: 'turn-start',
        })) ||
        {
          ...initializedGame,
          phase: 'turn-start',
        }
      setLocalGame(initializeGameState(persistedGame))
      setPlayStage('turn-start')
    } catch {
      setSaveError('We could not open the next turn yet. Please try again.')
    } finally {
      setIsAdvancingTurn(false)
    }
  }

  const turnNumber = playStage === 'turn-summary' ? latestResolution?.turnNumber ?? initializedGame.turnNumber : initializedGame.turnNumber
  const dashboardItems = [
    { label: 'Cash', value: formatMoney(displayPlayer.cash) },
    { label: 'Debt', value: formatMoney(displayPlayer.debt) },
    { label: 'Net worth', value: formatMoney(displayPlayer.netWorth) },
    { label: 'Physical health', value: `${displayPlayer.physicalHealth}` },
    { label: 'Mental health', value: `${displayPlayer.mentalHealth}` },
  ]

  return (
    <section className="play-game-page">
      <div className="play-game-header">
        <p className="eyebrow">Take a Turn</p>
        <h2>{initializedGame.name}</h2>
        <p className="tagline">
          Month {turnNumber}. {displayPlayer.name} is in seat {displaySeatIndex + 1} of {initializedGame.players.length}.
        </p>
      </div>

      <section className="play-game-panel play-game-seat-order" aria-label="Seat order">
        {initializedGame.players.map((player, index) => {
          const isActive = playStage === 'turn-summary' ? player.id === displayPlayer.id : index === initializedGame.activePlayerIndex
          return (
            <div key={player.id} className={`play-seat-chip${isActive ? ' is-active' : ''}`}>
              <span className="play-seat-avatar" aria-hidden="true">
                <PlayerAvatar avatar={player.avatar} decorative />
              </span>
              <div>
                <strong>{player.name}</strong>
                <span>{isActive ? 'Taking this turn' : `Seat ${index + 1}`}</span>
              </div>
            </div>
          )
        })}
      </section>

      <section className="play-game-panel play-game-dashboard">
        <div className="play-player-card">
          <div className="play-player-title">
            <span className="play-player-avatar" aria-hidden="true">
              <PlayerAvatar avatar={displayPlayer.avatar} decorative />
            </span>
            <div>
              <h3>{displayPlayer.name}</h3>
              <p>
                {displayPlayer.jobId ? displayPlayer.jobId.replace(/-/g, ' ') : 'Career pending'} in{' '}
                {displayPlayer.cityId.replace(/-/g, ' ')}
              </p>
            </div>
          </div>
          <dl className="play-stat-grid">
            {dashboardItems.map((item) => (
              <div key={item.label} className="play-stat-card">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="play-phase-panel">
          <h3>Monthly phases</h3>
          <ol>
            <li>Net worth changes</li>
            <li>Debt updates</li>
            <li>Health updates</li>
            <li>Event resolution</li>
            <li>Player action</li>
            <li>End-of-turn summary</li>
          </ol>
        </div>
      </section>

      {playStage === 'turn-start' || playStage === 'action-select' ? (
        <section className="play-game-panel play-action-panel">
          <div className="play-panel-heading">
            <div>
              <p className="eyebrow">Action Phase</p>
              <h3>Choose one action for this month</h3>
            </div>
            {playStage === 'turn-start' ? (
              <SecondaryButton onClick={() => setPlayStage('action-select')}>Review actions</SecondaryButton>
            ) : null}
          </div>

          {playStage === 'turn-start' ? (
            <div className="play-turn-preview">
              <p>
                Income, recurring costs, debt pressure, health drift, and one life event will resolve before your chosen
                action is applied.
              </p>
              <p>Select an action when you are ready to take the month.</p>
            </div>
          ) : (
            <>
              <div className="play-action-grid" role="radiogroup" aria-label="Available actions">
                {actionCatalog.map((action) => {
                  const isSelected = action.id === selectedActionId
                  return (
                    <button
                      key={action.id}
                      type="button"
                      className={`play-action-card${isSelected ? ' is-selected' : ''}`}
                      onClick={() => action.isAvailable && handleActionChange(action.id)}
                      aria-pressed={isSelected}
                      disabled={!action.isAvailable}
                    >
                      <div className="play-action-copy">
                        <h4>{action.label}</h4>
                        <p>{action.summary}</p>
                      </div>
                      <span className="play-action-detail">{action.detail}</span>
                      {!action.isAvailable && action.unavailableReason ? (
                        <span className="play-action-unavailable">{action.unavailableReason}</span>
                      ) : null}
                    </button>
                  )
                })}
              </div>

              {selectedAction?.requiresTarget ? (
                <label className="field">
                  <span>New city</span>
                  <select value={relocationTarget} onChange={(event) => setRelocationTarget(event.target.value)}>
                    <option value="">Choose a city</option>
                    {selectedAction.targetOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {saveError ? (
                <p className="field-error" role="alert">
                  {saveError}
                </p>
              ) : null}

              <div className="play-game-actions">
                <SecondaryButton onClick={() => setPlayStage('turn-start')}>Back</SecondaryButton>
                <PrimaryButton onClick={handleTakeTurn} disabled={!canResolveTurn || isSavingTurn}>
                  {isSavingTurn ? 'Saving turn...' : 'Take turn'}
                </PrimaryButton>
              </div>
            </>
          )}
        </section>
      ) : null}

      {playStage === 'turn-summary' && latestResolution ? (
        <section className="play-game-panel play-summary-panel">
          <div className="play-panel-heading">
            <div>
              <p className="eyebrow">Turn Summary</p>
              <h3>{latestResolution.playerName}&apos;s month in review</h3>
            </div>
          </div>

          <div className="play-outcome-grid">
            <div className="play-outcome-card">
              <h4>Intended outcomes</h4>
              <ul>
                {[...(latestResolution.event.intended || []), ...(latestResolution.action.intended || [])].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="play-outcome-card">
              <h4>Unintended outcomes</h4>
              <ul>
                {[...(latestResolution.event.unintended || []), ...(latestResolution.action.unintended || [])].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="play-phase-summary-list">
            {latestResolution.phases.map((phase) => (
              <article key={phase.id} className="play-phase-summary-card">
                <div className="play-phase-summary-header">
                  <h4>{phase.title}</h4>
                  <p>{phase.explanation}</p>
                </div>
                <div className="play-phase-deltas">
                  {phase.deltas.map((delta) => (
                    <div key={`${phase.id}-${delta.label}`}>
                      <span>{delta.label}</span>
                      <strong>{delta.changeLabel}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="play-game-actions">
            <PrimaryButton onClick={() => setPlayStage('pass-control')}>Pass device</PrimaryButton>
          </div>
        </section>
      ) : null}

      {playStage === 'pass-control' ? (
        <section className="play-game-panel play-pass-panel">
          <p className="eyebrow">Pass Control</p>
          <h3>{passControlPlayer?.name || 'Next player'}, you&apos;re up next.</h3>
          <p className="tagline">
            Hand the device to the next player before starting month {initializedGame.turnNumber}.
          </p>
          {saveError ? (
            <p className="field-error" role="alert">
              {saveError}
            </p>
          ) : null}
          <div className="play-game-actions">
            <SecondaryButton onClick={onHome}>Back to home</SecondaryButton>
            <PrimaryButton onClick={handleStartNextTurn} disabled={isAdvancingTurn}>
              {isAdvancingTurn ? 'Opening turn...' : 'Start next turn'}
            </PrimaryButton>
          </div>
        </section>
      ) : null}

      {playStage !== 'pass-control' ? (
        <div className="play-game-actions">
          <SecondaryButton onClick={onHome}>Back to home</SecondaryButton>
        </div>
      ) : null}
    </section>
  )
}

export default PlayGamePage
