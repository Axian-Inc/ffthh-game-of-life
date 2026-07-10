import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import ActionPlannerModal from '../modals/ActionPlannerModal'
import { PLAY_TURN_STAT_ICONS } from '../../data/playTurnPlaceholder'
import { getLifeLessonSpotlight } from '../../data/lifeLessonSpotlights'
import { getCareerLabel, getCityLabel } from '../../simulation/definitions'
import './play-game-page.css'

const noop = () => {}

const getPlayers = (game) => (Array.isArray(game?.players) ? game.players : [])

const getActivePlayerIndex = (game, players) => {
  if (players.length === 0) {
    return 0
  }
  if (!Number.isInteger(game?.activePlayerIndex) || game.activePlayerIndex < 0) {
    return 0
  }
  return game.activePlayerIndex % players.length
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)

const formatDelta = (value, formatter = (innerValue) => innerValue) => {
  const safeValue = Number(value) || 0
  const prefix = safeValue > 0 ? '+' : ''
  return `${prefix}${formatter(safeValue)}`
}

const getMeterToneClass = (value) => {
  if (value >= 70) {
    return 'is-good'
  }
  if (value >= 40) {
    return 'is-warning'
  }
  return 'is-danger'
}

const renderDeltaPill = (label, value, type = 'number') => {
  const formatter = type === 'currency' ? formatCurrency : (innerValue) => innerValue
  const tone = value > 0 ? 'is-positive' : value < 0 ? 'is-negative' : 'is-neutral'

  return (
    <span className={`play-turn-delta-pill ${tone}`.trim()} key={label}>
      <strong>{label}</strong>
      <span>{formatDelta(value, formatter)}</span>
    </span>
  )
}

const formatCurrentWithDelta = (currentValue, deltaValue, type = 'number') => {
  const baseFormatter = type === 'currency' ? formatCurrency : (innerValue) => innerValue
  if (!deltaValue) {
    return baseFormatter(currentValue)
  }
  return `${baseFormatter(currentValue)} (${formatDelta(deltaValue, baseFormatter)})`
}

const PlayGamePage = ({
  game,
  isAdvancingTurn = false,
  onPreviousPlayer = noop,
  onNextPlayer = noop,
  onSeeHistory = noop,
  onBeginTurn = noop,
  onContinueToBrief = noop,
  onRevealNextTurn = noop,
  onToggleAction = noop,
  onEndTurn = noop,
  onResetTurnPlan = noop,
  turnPlan = {
    stage: 'brief',
    actionPoints: 0,
    remainingActionPoints: 0,
    selectedActions: [],
    curatedActions: [],
    issueActions: [],
    explanation: '',
    brief: null,
    reveal: null,
  },
}) => {
  const players = getPlayers(game)
  const activePlayerIndex = getActivePlayerIndex(game, players)
  const activePlayer = players[activePlayerIndex] || null
  const turnNumber = Number.isInteger(game?.turnNumber) && game.turnNumber > 0 ? game.turnNumber : 1
  const activePlayerName = activePlayer?.name?.trim() || 'Player'
  const activePlayerCash = Number.isFinite(activePlayer?.cash) ? activePlayer.cash : 0
  const activePlayerDebt = Number.isFinite(activePlayer?.debt) ? activePlayer.debt : 0
  const activePlayerAssets = Number.isFinite(activePlayer?.assetsValue) ? activePlayer.assetsValue : 0
  const activePlayerNetWorth = Number.isFinite(activePlayer?.netWorth)
    ? activePlayer.netWorth
    : activePlayerCash + activePlayerAssets - activePlayerDebt
  const activePlayerIncome = Number.isFinite(activePlayer?.monthlyIncome) ? activePlayer.monthlyIncome : 0
  const activePlayerPhysicalHealth = Math.max(0, Math.min(100, Number(activePlayer?.physicalHealth) || 0))
  const activePlayerMentalHealth = Math.max(0, Math.min(100, Number(activePlayer?.mentalHealth) || 0))
  const activePlayerStress = Math.max(0, Math.min(100, Number(activePlayer?.stress) || 0))
  const brief = turnPlan?.brief || {}
  const previousTurnSummary = brief.previousTurnSummary || null
  const progressionArcs = Array.isArray(brief.progressionArcs) ? brief.progressionArcs : []
  const revealedConsequences = Array.isArray(brief.revealedConsequences) ? brief.revealedConsequences : []
  const activeIssues = Array.isArray(brief.activeIssues) ? brief.activeIssues : []
  const selectedActionIds = Array.isArray(turnPlan?.selectedActions) ? turnPlan.selectedActions : []
  const curatedActions = Array.isArray(turnPlan?.curatedActions) ? turnPlan.curatedActions : []
  const issueActions = Array.isArray(turnPlan?.issueActions) ? turnPlan.issueActions : []
  const stage = turnPlan?.stage || 'brief'
  const reveal = turnPlan?.reveal || {}
  const highlightedDeltaMap = new Map((reveal.topDeltaCards || []).map((item) => [item.key, item]))
  const lifeLessonSpotlight = getLifeLessonSpotlight({ player: activePlayer, turnNumber })

  const financialStats = [
    {
      id: 'net-worth',
      label: 'Net Worth',
      value: formatCurrentWithDelta(activePlayerNetWorth, highlightedDeltaMap.get('netWorth')?.value || 0, 'currency'),
      iconSrc: PLAY_TURN_STAT_ICONS.moneyBagIcon,
      tone: activePlayerNetWorth < 0 ? 'negative' : 'neutral',
      isChanged: highlightedDeltaMap.has('netWorth'),
    },
    {
      id: 'cash',
      label: 'Cash',
      value: formatCurrentWithDelta(activePlayerCash, highlightedDeltaMap.get('cash')?.value || 0, 'currency'),
      iconSrc: PLAY_TURN_STAT_ICONS.cashIcon,
      isChanged: highlightedDeltaMap.has('cash'),
    },
    {
      id: 'assets',
      label: 'Assets',
      value: formatCurrency(activePlayerAssets),
      iconSrc: PLAY_TURN_STAT_ICONS.assetsIcon,
    },
    {
      id: 'debt',
      label: 'Debt',
      value: formatCurrentWithDelta(activePlayerDebt, highlightedDeltaMap.get('debt')?.value || 0, 'currency'),
      iconSrc: PLAY_TURN_STAT_ICONS.debtIcon,
      tone: activePlayerDebt > 0 ? 'negative' : 'neutral',
      isChanged: highlightedDeltaMap.has('debt'),
    },
  ]

  const statusStats = [
    { id: 'job', label: 'Job', value: getCareerLabel(activePlayer?.jobId), iconSrc: PLAY_TURN_STAT_ICONS.briefcaseIcon },
    {
      id: 'income',
      label: 'Income',
      value: `${formatCurrency(activePlayerIncome)} / month`,
      iconSrc: PLAY_TURN_STAT_ICONS.incomeIcon,
    },
    {
      id: 'location',
      label: 'Location',
      value: getCityLabel(activePlayer?.cityId),
      iconSrc: PLAY_TURN_STAT_ICONS.locationIcon,
    },
    {
      id: 'physical-health',
      label: `Physical Health (${formatCurrentWithDelta(activePlayerPhysicalHealth, highlightedDeltaMap.get('physicalHealth')?.value || 0)})`,
      value: activePlayerPhysicalHealth,
      iconSrc: PLAY_TURN_STAT_ICONS.heartIcon,
      kind: 'meter',
      tone: getMeterToneClass(activePlayerPhysicalHealth),
      isChanged: highlightedDeltaMap.has('physicalHealth'),
    },
    {
      id: 'mental-health',
      label: `Mental Health (${formatCurrentWithDelta(activePlayerMentalHealth, highlightedDeltaMap.get('mentalHealth')?.value || 0)})`,
      value: activePlayerMentalHealth,
      iconSrc: PLAY_TURN_STAT_ICONS.brainIcon,
      kind: 'meter',
      tone: getMeterToneClass(activePlayerMentalHealth),
      isChanged: highlightedDeltaMap.has('mentalHealth'),
    },
    {
      id: 'stress',
      label: `Stress (${formatCurrentWithDelta(activePlayerStress, highlightedDeltaMap.get('stress')?.value || 0)})`,
      value: activePlayerStress,
      iconSrc: PLAY_TURN_STAT_ICONS.brainIcon,
      kind: 'meter',
      tone: getMeterToneClass(100 - activePlayerStress),
      isChanged: highlightedDeltaMap.has('stress'),
    },
  ]

  if (stage === 'handoff') {
    return (
      <section aria-label="Player turn handoff" className="play-turn-page play-turn-stage">
        <div className="play-turn-stage-card">
          <p className="play-turn-stage-eyebrow">Pass-and-play handoff</p>
          <h2 className="play-turn-stage-title">{`Pass to ${activePlayerName}`}</h2>
          <p className="play-turn-stage-copy">{`Turn ${turnNumber} is ready. Hand the screen to ${activePlayerName}, then reveal the new month.`}</p>
          <PrimaryButton className="play-turn-action-primary" onClick={onRevealNextTurn}>
            Reveal Next Month
          </PrimaryButton>
        </div>
      </section>
    )
  }

  if (stage === 'turn_reveal') {
    return (
      <section aria-label="Turn reveal" className="play-turn-page play-turn-stage">
        <div className="play-turn-stage-card play-turn-stage-card-reveal">
          <p className="play-turn-stage-eyebrow">{`Turn ${reveal.turnNumber || turnNumber}`}</p>
          <h2 className="play-turn-stage-title">{`${reveal.playerName || activePlayerName}'s Month Begins`}</h2>
          <p className="play-turn-stage-copy">{reveal.monthHeadline || 'A new month has arrived, and life did not stand still.'}</p>

          {(reveal.topDeltaCards || []).length ? (
            <div className="play-turn-stage-delta-grid">
              {reveal.topDeltaCards.map((item) => renderDeltaPill(item.label, item.value, item.type))}
            </div>
          ) : null}

          {reveal.callouts?.length ? (
            <ul className="play-turn-callout-list play-turn-callout-list-reveal">
              {reveal.callouts.map((callout) => (
                <li key={callout}>{callout}</li>
              ))}
            </ul>
          ) : null}

          {reveal.revealedConsequences?.length ? (
            <div className="play-turn-story-grid">
              {reveal.revealedConsequences.map((consequence) => (
                <article className={`play-turn-story-card ${consequence.tone ? `is-${consequence.tone}` : ''}`.trim()} key={consequence.id}>
                  <strong>{consequence.label}</strong>
                  <p>{consequence.headline}</p>
                </article>
              ))}
            </div>
          ) : null}

          <PrimaryButton className="play-turn-action-primary" onClick={onContinueToBrief}>
            Continue to Brief
          </PrimaryButton>
        </div>
      </section>
    )
  }

  return (
    <>
      <section aria-label="Player turn" className="play-turn-page">
        <header className="play-turn-topbar">
          <div className="play-turn-header">
            <h2 className="play-turn-sr-only">{`Modern Game of Life - Turn ${turnNumber}`}</h2>
            <p className="play-turn-sr-only">{`${activePlayerName}'s Turn`}</p>
            <p className="play-turn-header-eyebrow">{`Turn ${turnNumber}`}</p>
            <h2 className="play-turn-title">{`${activePlayerName}'s Month`}</h2>
          </div>

          <div className="play-turn-rail" role="group" aria-label="Turn order">
            <button aria-label="Previous player" className="play-turn-chevron" onClick={onPreviousPlayer} type="button">
              <ChevronLeft aria-hidden="true" />
            </button>

            <ul className="play-turn-player-list" style={{ '--rail-player-count': players.length || 1 }}>
              {players.map((player, index) => (
                <li className="play-turn-player" key={player.id || `player-${index}`}>
                  <div className={`play-turn-player-card ${index === activePlayerIndex ? 'is-active' : ''}`.trim()}>
                    <PlayerAvatar avatar={player.avatar} className="play-turn-player-avatar" decorative />
                  </div>
                  <span className="play-turn-player-name">{player.name || `Player ${index + 1}`}</span>
                </li>
              ))}
            </ul>

            <button aria-label="Next player" className="play-turn-chevron" onClick={onNextPlayer} type="button">
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="play-turn-dashboard">
          <section className="play-turn-brief-card" aria-label="Monthly brief">
            <div className="play-turn-brief-eyebrow">Start-of-turn brief</div>
            <h3 className="play-turn-brief-title">{brief.monthHeadline || 'Life keeps moving. Decide how to answer it.'}</h3>
            <p className="play-turn-brief-copy">
              {turnPlan?.explanation || 'Review the month, then decide how to spend your time and energy.'}
            </p>

            {previousTurnSummary ? (
              <div className="play-turn-brief-section">
                <p className="play-turn-brief-label">{`Since your last turn (${previousTurnSummary.actionLabel})`}</p>
                <div className="play-turn-delta-grid">
                  {renderDeltaPill('Net', previousTurnSummary.statDelta?.netWorth || 0, 'currency')}
                  {renderDeltaPill('Stress', previousTurnSummary.statDelta?.stress || 0)}
                  {renderDeltaPill('Mental', previousTurnSummary.statDelta?.mentalHealth || 0)}
                  {renderDeltaPill('Physical', previousTurnSummary.statDelta?.physicalHealth || 0)}
                </div>
                {previousTurnSummary.topCallouts?.length ? (
                  <ul className="play-turn-callout-list">
                    {previousTurnSummary.topCallouts.map((callout) => (
                      <li key={callout}>{callout}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {revealedConsequences.length ? (
              <div className="play-turn-brief-section">
                <p className="play-turn-brief-label">This month catches up with you</p>
                <div className="play-turn-story-grid">
                  {revealedConsequences.map((consequence) => (
                    <article className={`play-turn-story-card ${consequence.tone ? `is-${consequence.tone}` : ''}`.trim()} key={consequence.id}>
                      <strong>{consequence.label}</strong>
                      <p>{consequence.headline}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {activeIssues.length ? (
              <div className="play-turn-brief-section">
                <p className="play-turn-brief-label">Pressure building</p>
                <div className="play-turn-story-grid">
                  {activeIssues.map((issue) => (
                    <article className="play-turn-story-card is-bad" key={issue.id}>
                      <strong>{issue.label}</strong>
                      <p>{issue.headline || 'This problem will keep getting worse if you ignore it.'}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {progressionArcs.length ? (
              <div className="play-turn-brief-section">
                <p className="play-turn-brief-label">Longer-term arcs</p>
                <div className="play-turn-arc-grid">
                  {progressionArcs.map((arc) => (
                    <article className="play-turn-arc-card" key={arc.id}>
                      <strong>{arc.label}</strong>
                      <span>{arc.headline}</span>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="play-turn-brief-actions">
              <SecondaryButton className="play-turn-action-muted" onClick={onSeeHistory}>
                See History
              </SecondaryButton>
              {stage === 'brief' ? (
                <PrimaryButton className="play-turn-action-primary" onClick={onBeginTurn}>
                  Plan This Month
                </PrimaryButton>
              ) : (
                <SecondaryButton className="play-turn-action-muted" onClick={onResetTurnPlan}>
                  Re-read Brief
                </SecondaryButton>
              )}
            </div>
          </section>

          <section className="play-turn-status-card" aria-label="Player status">
            <div className="play-turn-status-topline">
              <div>
                <p className="play-turn-status-eyebrow">Action Points</p>
                <h3>{`${turnPlan?.remainingActionPoints || 0} / ${turnPlan?.actionPoints || 0}`}</h3>
              </div>
              <div className="play-turn-status-caption">
                Spend points on a few strong moves instead of one flat action.
              </div>
            </div>

            <article className={'play-turn-life-lesson is-' + lifeLessonSpotlight.tone} aria-label="Life lesson spotlight">
              <div className="play-turn-life-lesson-topline">
                <span className="play-turn-life-lesson-icon" aria-hidden="true">
                  <Sparkles />
                </span>
                <div>
                  <p className="play-turn-life-lesson-eyebrow">Life Lesson Spotlight</p>
                  <h4>{lifeLessonSpotlight.title}</h4>
                </div>
              </div>
              <p>{lifeLessonSpotlight.prompt}</p>
              <strong>{lifeLessonSpotlight.takeaway}</strong>
            </article>

            <div className="play-turn-status-columns">
              <section className="play-turn-status-column" aria-label="Financial overview">
                {financialStats.map((item) => (
                  <div className={`play-turn-stat-row ${item.isChanged ? 'is-changed' : ''}`.trim()} key={item.id}>
                    <span className="play-turn-stat-icon" aria-hidden="true">
                      <img alt="" src={item.iconSrc} />
                    </span>
                    <div className="play-turn-stat-copy">
                      <p className="play-turn-stat-label">{item.label}</p>
                      <p className={`play-turn-stat-value ${item.tone === 'negative' ? 'is-negative' : ''}`.trim()}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </section>

              <section className="play-turn-status-column" aria-label="Player meters">
                {statusStats.map((item) =>
                  item.kind === 'meter' ? (
                    <div className={`play-turn-stat-row play-turn-stat-row-meter ${item.isChanged ? 'is-changed' : ''}`.trim()} key={item.id}>
                      <span className="play-turn-stat-icon" aria-hidden="true">
                        <img alt="" src={item.iconSrc} />
                      </span>
                      <div className="play-turn-stat-copy">
                        <p className="play-turn-stat-label play-turn-stat-label-inline">{item.label}</p>
                        <div className="play-turn-meter">
                          <span className={`play-turn-meter-fill ${item.tone ? ` ${item.tone}` : ''}`.trim()} style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="play-turn-stat-row" key={item.id}>
                      <span className="play-turn-stat-icon" aria-hidden="true">
                        <img alt="" src={item.iconSrc} />
                      </span>
                      <div className="play-turn-stat-copy">
                        <p className="play-turn-stat-label">{item.label}</p>
                        <p className="play-turn-stat-value">{item.value}</p>
                      </div>
                    </div>
                  ),
                )}
              </section>
            </div>
          </section>
        </div>
      </section>

      <ActionPlannerModal
        actionPoints={turnPlan?.actionPoints || 0}
        curatedActions={curatedActions}
        isAdvancingTurn={isAdvancingTurn}
        isOpen={stage === 'action'}
        issueActions={issueActions}
        onClose={onResetTurnPlan}
        onEndTurn={onEndTurn}
        onToggleAction={onToggleAction}
        remainingActionPoints={turnPlan?.remainingActionPoints || 0}
        selectedActionIds={selectedActionIds}
      />
    </>
  )
}

export default PlayGamePage
