import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import {
  PLAY_TURN_MODIFIER_GROUPS,
  PLAY_TURN_STAT_ICONS,
} from '../../data/playTurnPlaceholder'
import { getAvailableTurnActions } from '../../simulation/actionCatalog'
import { getCareerLabel, getCityLabel } from '../../simulation/definitions'
import { getActionPotentialEffects } from '../../simulation/turnResolver'
import './play-game-page.css'

const noop = () => {}

const ACTION_STAT_ORDER = ['cash', 'debt', 'assetsValue', 'physicalHealth', 'mentalHealth', 'stress']
const MONEY_STAT_KEYS = new Set(['netWorth', 'cash', 'assetsValue', 'debt', 'monthlyIncome'])
const INVERTED_DELTA_STAT_KEYS = new Set(['debt', 'stress'])

const STAT_LABELS = {
  netWorth: 'Net Worth',
  cash: 'Cash',
  assetsValue: 'Assets',
  debt: 'Debt',
  monthlyIncome: 'Income',
  physicalHealth: 'Physical Health',
  mentalHealth: 'Mental Health',
  stress: 'Stress',
}

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

const getPlayerKey = (player, index) => {
  if (player?.id != null) {
    return String(player.id)
  }
  return `player-${index}`
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)

const formatStatValue = (statKey, value) => {
  if (MONEY_STAT_KEYS.has(statKey)) {
    return formatCurrency(value)
  }
  return `${Math.round(Number.isFinite(value) ? value : 0)}`
}

const formatDeltaValue = (statKey, value) => {
  const roundedValue = Math.round(Number.isFinite(value) ? value : 0)
  if (roundedValue === 0) {
    return MONEY_STAT_KEYS.has(statKey) ? '$0' : '0'
  }
  if (MONEY_STAT_KEYS.has(statKey)) {
    const sign = roundedValue > 0 ? '+' : '-'
    return `${sign}${formatCurrency(Math.abs(roundedValue))}`
  }
  return `${roundedValue > 0 ? '+' : ''}${roundedValue}`
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

const getMagnitudeLevel = (statKey, amount) => {
  const absoluteAmount = Math.abs(amount)
  if (MONEY_STAT_KEYS.has(statKey) || statKey === 'assetsValue') {
    if (absoluteAmount >= 700) {
      return 3
    }
    if (absoluteAmount >= 250) {
      return 2
    }
    return 1
  }
  if (absoluteAmount >= 4) {
    return 3
  }
  if (absoluteAmount >= 2) {
    return 2
  }
  return 1
}

const getEffectSymbol = (statKey, range) => {
  if (!range || (range.min === 0 && range.max === 0)) {
    return ''
  }
  if (range.min < 0 && range.max > 0) {
    return '+/-'
  }

  const representative = range.max > 0 ? range.max : range.min
  const magnitude = getMagnitudeLevel(statKey, Math.max(Math.abs(range.min), Math.abs(range.max)))
  return representative > 0 ? '+'.repeat(magnitude) : '-'.repeat(magnitude)
}

const getEffectTone = (statKey, range) => {
  if (!range) {
    return 'neutral'
  }
  if (range.min < 0 && range.max > 0) {
    return 'mixed'
  }
  const isPositiveDelta = range.max > 0
  if (INVERTED_DELTA_STAT_KEYS.has(statKey)) {
    return isPositiveDelta ? 'negative' : 'positive'
  }
  return isPositiveDelta ? 'positive' : 'negative'
}

const getPreviewRangeForStat = (preview, statKey) => {
  const range = preview?.ranges?.[statKey]
  if (range) {
    return range
  }

  const delta = preview?.delta?.[statKey] || 0
  return { min: delta, max: delta }
}

const getActionEffectItems = (action, player) => {
  const preview = action?.effectPreview || getActionPotentialEffects({ actionType: action?.id, player })
  return ACTION_STAT_ORDER.map((statKey) => {
    const range = getPreviewRangeForStat(preview, statKey)
    if (!range || (range.min === 0 && range.max === 0)) {
      return null
    }

    return {
      key: statKey,
      label: STAT_LABELS[statKey],
      range,
      symbol: getEffectSymbol(statKey, range),
      tone: getEffectTone(statKey, range),
    }
  }).filter(Boolean)
}

const getLatestPlayerHistoryEntry = (game, player, playerIndex) => {
  const moveHistory = Array.isArray(game?.moveHistory) ? game.moveHistory : []
  const playerKey = getPlayerKey(player, playerIndex)

  for (let index = moveHistory.length - 1; index >= 0; index -= 1) {
    if (String(moveHistory[index]?.playerId) === playerKey) {
      return moveHistory[index]
    }
  }

  return null
}

const getHistoricalStat = (historyEntry, statKey, currentValue) => {
  const preTurnValue = historyEntry?.turnLog?.preTurn?.[statKey]
  const totalDelta = historyEntry?.turnLog?.totalDelta?.[statKey]
  const statDelta = historyEntry?.statDelta?.[statKey]
  const resolvedDelta = Number.isFinite(totalDelta) ? totalDelta : statDelta
  const previousValue = Number.isFinite(preTurnValue)
    ? preTurnValue
    : Number.isFinite(resolvedDelta)
      ? currentValue - resolvedDelta
      : currentValue

  return {
    previousValue,
    delta: currentValue - previousValue,
  }
}

const getStatScaleMax = (statKey, currentValue, previousValue, monthlyIncome) => {
  if (statKey === 'physicalHealth' || statKey === 'mentalHealth' || statKey === 'stress') {
    return 100
  }

  const absoluteMax = Math.max(Math.abs(currentValue), Math.abs(previousValue), 1)
  const incomeBase = Math.max(Math.abs(monthlyIncome) * 1.2, 1000)
  return Math.max(absoluteMax * 1.25, incomeBase)
}

const getPercent = (value, maxValue) => {
  if (!Number.isFinite(maxValue) || maxValue <= 0) {
    return 0
  }
  return Math.max(0, Math.min(100, (value / maxValue) * 100))
}

const getDeltaTone = (statKey, delta) => {
  if (delta === 0) {
    return 'neutral'
  }
  const isPositiveDelta = delta > 0
  if (INVERTED_DELTA_STAT_KEYS.has(statKey)) {
    return isPositiveDelta ? 'negative' : 'positive'
  }
  return isPositiveDelta ? 'positive' : 'negative'
}

const createStatItem = ({ id, statKey, label, value, iconSrc, monthlyIncome, historyEntry, tone }) => {
  const currentValue = Number.isFinite(value) ? value : 0
  const historical = getHistoricalStat(historyEntry, statKey, currentValue)
  const maxValue = getStatScaleMax(statKey, currentValue, historical.previousValue, monthlyIncome)
  const currentPercent = getPercent(currentValue, maxValue)
  const previousPercent = getPercent(historical.previousValue, maxValue)
  const delta = currentValue - historical.previousValue

  return {
    id,
    statKey,
    label,
    value: currentValue,
    displayValue: formatStatValue(statKey, currentValue),
    iconSrc,
    tone,
    delta,
    deltaTone: getDeltaTone(statKey, delta),
    deltaText: formatDeltaValue(statKey, delta),
    currentPercent,
    previousPercent,
  }
}

const StatDeltaBar = ({ item }) => {
  const changeStart = Math.min(item.currentPercent, item.previousPercent)
  const changeWidth = Math.abs(item.currentPercent - item.previousPercent)
  const baseWidth = changeWidth > 0 ? changeStart : item.currentPercent

  return (
    <div className="play-turn-meter" aria-hidden="true">
      <span
        className={`play-turn-meter-base ${item.tone ? ` ${item.tone}` : ''}`.trim()}
        style={{ width: `${baseWidth}%` }}
      />
      {changeWidth > 0 ? (
        <span
          className={`play-turn-meter-change ${item.deltaTone === 'positive' ? 'is-up' : 'is-down'}`}
          style={{ left: `${changeStart}%`, width: `${changeWidth}%` }}
        />
      ) : null}
    </div>
  )
}

const PlayGamePage = ({
  game,
  isAdvancingTurn = false,
  onPreviousPlayer = noop,
  onNextPlayer = noop,
  onSeeHistory = noop,
  actionOptions = { regularActions: [], advancedActions: [], unexpectedActions: [] },
  onActionPick = noop,
}) => {
  const [hoveredActionId, setHoveredActionId] = useState(null)
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

  const hasProvidedActions = Array.isArray(actionOptions?.regularActions) && actionOptions.regularActions.length > 0
  const derivedActionOptions =
    hasProvidedActions || !game || !activePlayer
      ? actionOptions
      : getAvailableTurnActions({
          game,
          player: activePlayer,
          turnNumber,
        })

  const regularActions = Array.isArray(derivedActionOptions?.regularActions) ? derivedActionOptions.regularActions : []
  const advancedActions = Array.isArray(derivedActionOptions?.advancedActions) ? derivedActionOptions.advancedActions : []
  const unexpectedActions = Array.isArray(derivedActionOptions?.unexpectedActions)
    ? derivedActionOptions.unexpectedActions
    : []
  const latestHistoryEntry = getLatestPlayerHistoryEntry(game, activePlayer, activePlayerIndex)

  const financialStats = [
    createStatItem({
      id: 'net-worth',
      statKey: 'netWorth',
      label: 'Net Worth',
      value: activePlayerNetWorth,
      iconSrc: PLAY_TURN_STAT_ICONS.moneyBagIcon,
      monthlyIncome: activePlayerIncome,
      historyEntry: latestHistoryEntry,
      tone: activePlayerNetWorth < 0 ? 'is-danger' : 'is-good',
    }),
    createStatItem({
      id: 'cash',
      statKey: 'cash',
      label: 'Cash',
      value: activePlayerCash,
      iconSrc: PLAY_TURN_STAT_ICONS.cashIcon,
      monthlyIncome: activePlayerIncome,
      historyEntry: latestHistoryEntry,
      tone: activePlayerCash < 0 ? 'is-danger' : 'is-good',
    }),
    createStatItem({
      id: 'assets',
      statKey: 'assetsValue',
      label: 'Assets',
      value: activePlayerAssets,
      iconSrc: PLAY_TURN_STAT_ICONS.assetsIcon,
      monthlyIncome: activePlayerIncome,
      historyEntry: latestHistoryEntry,
      tone: 'is-good',
    }),
    createStatItem({
      id: 'debt',
      statKey: 'debt',
      label: 'Debt',
      value: activePlayerDebt,
      iconSrc: PLAY_TURN_STAT_ICONS.debtIcon,
      monthlyIncome: activePlayerIncome,
      historyEntry: latestHistoryEntry,
      tone: activePlayerDebt > activePlayerIncome * 2 ? 'is-danger' : 'is-warning',
    }),
  ]

  const statusStats = [
    {
      id: 'job',
      label: 'Job',
      value: getCareerLabel(activePlayer?.jobId),
      iconSrc: PLAY_TURN_STAT_ICONS.briefcaseIcon,
      kind: 'text',
    },
    createStatItem({
      id: 'income',
      statKey: 'monthlyIncome',
      label: 'Income',
      value: activePlayerIncome,
      iconSrc: PLAY_TURN_STAT_ICONS.incomeIcon,
      monthlyIncome: activePlayerIncome,
      historyEntry: latestHistoryEntry,
      tone: 'is-good',
    }),
    {
      id: 'location',
      label: 'Location',
      value: getCityLabel(activePlayer?.cityId),
      iconSrc: PLAY_TURN_STAT_ICONS.locationIcon,
      kind: 'text',
    },
    createStatItem({
      id: 'physical-health',
      statKey: 'physicalHealth',
      label: 'Physical Health',
      value: activePlayerPhysicalHealth,
      iconSrc: PLAY_TURN_STAT_ICONS.heartIcon,
      monthlyIncome: activePlayerIncome,
      historyEntry: latestHistoryEntry,
      tone: getMeterToneClass(activePlayerPhysicalHealth),
    }),
    createStatItem({
      id: 'mental-health',
      statKey: 'mentalHealth',
      label: 'Mental Health',
      value: activePlayerMentalHealth,
      iconSrc: PLAY_TURN_STAT_ICONS.brainIcon,
      monthlyIncome: activePlayerIncome,
      historyEntry: latestHistoryEntry,
      tone: getMeterToneClass(activePlayerMentalHealth),
    }),
    createStatItem({
      id: 'stress',
      statKey: 'stress',
      label: 'Stress',
      value: activePlayerStress,
      iconSrc: PLAY_TURN_STAT_ICONS.brainIcon,
      monthlyIncome: activePlayerIncome,
      historyEntry: latestHistoryEntry,
      tone: getMeterToneClass(100 - activePlayerStress),
    }),
  ]

  const actionGroups = [
    { id: 'regular', title: 'Regular Actions', actions: regularActions },
    { id: 'advanced', title: 'Advanced Action', actions: advancedActions },
    { id: 'unexpected', title: 'Unexpected Issues', actions: unexpectedActions },
  ].filter((group) => group.actions.length > 0)

  const allActions = actionGroups.flatMap((group) => group.actions)
  const hoveredAction = allActions.find((action) => action.id === hoveredActionId) || null
  const hoveredEffectItems = hoveredAction ? getActionEffectItems(hoveredAction, activePlayer) : []
  const hoveredEffectsByStat = Object.fromEntries(hoveredEffectItems.map((item) => [item.key, item]))

  const renderStatRow = (item) => {
    if (item.kind === 'text') {
      return (
        <div className="play-turn-stat-row" key={item.id}>
          <span className="play-turn-stat-icon" aria-hidden="true">
            <img alt="" src={item.iconSrc} />
          </span>
          <div className="play-turn-stat-copy">
            <p className="play-turn-stat-label">{item.label}:</p>
            <p className="play-turn-stat-value">{item.value}</p>
          </div>
        </div>
      )
    }

    const hoverEffect = hoveredEffectsByStat[item.statKey]
    const hasDelta = Math.round(item.delta) !== 0

    return (
      <div
        className={`play-turn-stat-row play-turn-stat-row-meter${hoverEffect ? ' is-previewed' : ''}`.trim()}
        key={item.id}
      >
        <span className="play-turn-stat-icon" aria-hidden="true">
          <img alt="" src={item.iconSrc} />
        </span>
        <div className="play-turn-stat-copy">
          <div className="play-turn-stat-heading">
            <p className="play-turn-stat-label">{item.label}:</p>
            <p className="play-turn-stat-value">{item.displayValue}</p>
          </div>
          <StatDeltaBar item={item} />
          {hasDelta ? (
            <p className={`play-turn-stat-delta ${item.deltaTone === 'positive' ? 'is-up' : 'is-down'}`}>
              {`${item.deltaText} last turn`}
            </p>
          ) : null}
        </div>
        {hoverEffect ? (
          <div className={`play-turn-stat-preview is-${hoverEffect.tone}`}>
            <strong>{hoverEffect.symbol}</strong>
          </div>
        ) : null}
      </div>
    )
  }

  const renderActionButton = (action, groupId) => (
    <button
      key={action.id}
      type="button"
      className={`play-turn-action-option is-${groupId}`}
      onClick={() => onActionPick(action.id)}
      onBlur={() => setHoveredActionId(null)}
      onFocus={() => setHoveredActionId(action.id)}
      onMouseEnter={() => setHoveredActionId(action.id)}
      onMouseLeave={() => setHoveredActionId(null)}
      disabled={isAdvancingTurn}
    >
      <strong>{action.label}</strong>
      <span>{action.description}</span>
    </button>
  )

  return (
    <section aria-label="Player turn" className="play-turn-page">
      <header className="play-turn-header">
        <h2 className="play-turn-title">{`Modern Game of Life - Turn ${turnNumber}`}</h2>
        <p className="play-turn-subtitle">{`${activePlayerName}'s Turn`}</p>
      </header>

      <div className="play-turn-rail" role="group" aria-label="Turn order">
        <button
          aria-label="Previous player"
          className="play-turn-chevron"
          onClick={onPreviousPlayer}
          type="button"
        >
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

      <div className="play-turn-status-card">
        <section className="play-turn-status-column" aria-label="Financial overview">
          {financialStats.map(renderStatRow)}
        </section>

        <section className="play-turn-status-column" aria-label="Player status">
          {statusStats.map(renderStatRow)}
        </section>

        <section className="play-turn-status-column play-turn-status-column-modifiers" aria-label="Modifiers">
          <h3 className="play-turn-modifiers-title">Modifier Icons</h3>
          {PLAY_TURN_MODIFIER_GROUPS.map((group) => (
            <div className="play-turn-modifier-group" key={group.id}>
              <p className="play-turn-modifier-group-title">{group.title}</p>
              <div className="play-turn-modifier-grid">
                {group.items.map((item) => (
                  <div className="play-turn-modifier-item" key={item.id}>
                    <span className="play-turn-modifier-icon" aria-hidden="true">
                      <img alt="" src={item.iconSrc} />
                    </span>
                    <span className="play-turn-modifier-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      <div className="play-turn-actions">
        <SecondaryButton className="play-turn-action-muted" onClick={onSeeHistory}>
          See History
        </SecondaryButton>
      </div>

      <section className="play-turn-action-picker" aria-label="Choose a turn action">
        <div className="play-turn-action-picker-header">
          <h3>Actions</h3>
        </div>
        {actionGroups.map((group) => (
          <div className="play-turn-action-picker-group" key={group.id}>
            <p className="play-turn-action-picker-group-title">{group.title}</p>
            <div className="play-turn-action-picker-grid">
              {group.actions.map((action) => renderActionButton(action, group.id))}
            </div>
          </div>
        ))}
      </section>
    </section>
  )
}

export default PlayGamePage
