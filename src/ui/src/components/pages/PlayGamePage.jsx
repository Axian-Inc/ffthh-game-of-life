import { ChevronLeft, ChevronRight } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import {
  PLAY_TURN_MODIFIER_GROUPS,
  PLAY_TURN_STAT_ICONS,
} from '../../data/playTurnPlaceholder'
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

const getMeterToneClass = (value) => {
  if (value >= 70) {
    return 'is-good'
  }
  if (value >= 40) {
    return 'is-warning'
  }
  return 'is-danger'
}

const PlayGamePage = ({
  game,
  isAdvancingTurn = false,
  onPreviousPlayer = noop,
  onNextPlayer = noop,
  onSeeHistory = noop,
  onChooseAction = noop,
  actionOptions = { regularActions: [], advancedActions: [], unexpectedActions: [] },
  isActionPickerOpen = false,
  onActionPick = noop,
  onCancelActionPicker = noop,
  onPass = noop,
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
  const regularActions = Array.isArray(actionOptions?.regularActions) ? actionOptions.regularActions : []
  const advancedActions = Array.isArray(actionOptions?.advancedActions) ? actionOptions.advancedActions : []
  const unexpectedActions = Array.isArray(actionOptions?.unexpectedActions) ? actionOptions.unexpectedActions : []

  const financialStats = [
    {
      id: 'net-worth',
      label: 'Net Worth',
      value: formatCurrency(activePlayerNetWorth),
      iconSrc: PLAY_TURN_STAT_ICONS.moneyBagIcon,
      tone: activePlayerNetWorth < 0 ? 'negative' : 'neutral',
    },
    {
      id: 'cash',
      label: 'Cash (Spendable)',
      value: formatCurrency(activePlayerCash),
      iconSrc: PLAY_TURN_STAT_ICONS.cashIcon,
    },
    {
      id: 'assets',
      label: 'Assets & Investments',
      value: formatCurrency(activePlayerAssets),
      iconSrc: PLAY_TURN_STAT_ICONS.assetsIcon,
    },
    {
      id: 'debt',
      label: 'Debt',
      value: formatCurrency(activePlayerDebt),
      iconSrc: PLAY_TURN_STAT_ICONS.debtIcon,
      tone: activePlayerDebt > 0 ? 'negative' : 'neutral',
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
      label: `Physical Health (${activePlayerPhysicalHealth})`,
      value: activePlayerPhysicalHealth,
      iconSrc: PLAY_TURN_STAT_ICONS.heartIcon,
      kind: 'meter',
      tone: getMeterToneClass(activePlayerPhysicalHealth),
    },
    {
      id: 'mental-health',
      label: `Mental Health (${activePlayerMentalHealth})`,
      value: activePlayerMentalHealth,
      iconSrc: PLAY_TURN_STAT_ICONS.brainIcon,
      kind: 'meter',
      tone: getMeterToneClass(activePlayerMentalHealth),
    },
    {
      id: 'stress',
      label: `Stress (${activePlayerStress})`,
      value: activePlayerStress,
      iconSrc: PLAY_TURN_STAT_ICONS.brainIcon,
      kind: 'meter',
      tone: getMeterToneClass(100 - activePlayerStress),
    },
  ]

  return (
    <section aria-label="Player turn placeholder" className="play-turn-page">
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
          {financialStats.map((item) => (
            <div className="play-turn-stat-row" key={item.id}>
              <span className="play-turn-stat-icon" aria-hidden="true">
                <img alt="" src={item.iconSrc} />
              </span>
              <div className="play-turn-stat-copy">
                <p className="play-turn-stat-label">{item.label}:</p>
                <p className={`play-turn-stat-value ${item.tone === 'negative' ? 'is-negative' : ''}`.trim()}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section className="play-turn-status-column" aria-label="Player status">
          {statusStats.map((item) =>
            item.kind === 'meter' ? (
              <div className="play-turn-stat-row play-turn-stat-row-meter" key={item.id}>
                <span className="play-turn-stat-icon" aria-hidden="true">
                  <img alt="" src={item.iconSrc} />
                </span>
                <div className="play-turn-stat-copy">
                  <p className="play-turn-stat-label play-turn-stat-label-inline">{item.label}</p>
                  <div className="play-turn-meter">
                    <span
                      className={`play-turn-meter-fill ${item.tone ? ` ${item.tone}` : ''}`.trim()}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="play-turn-stat-row" key={item.id}>
                <span className="play-turn-stat-icon" aria-hidden="true">
                  <img alt="" src={item.iconSrc} />
                </span>
                <div className="play-turn-stat-copy">
                  <p className="play-turn-stat-label">{item.label}:</p>
                  <p className="play-turn-stat-value">{item.value}</p>
                </div>
              </div>
            ),
          )}
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
        <PrimaryButton className="play-turn-action-primary" disabled={isAdvancingTurn} onClick={onChooseAction}>
          {isAdvancingTurn ? 'Advancing...' : 'Choose Action'}
        </PrimaryButton>
        <SecondaryButton className="play-turn-action-muted" disabled={isAdvancingTurn} onClick={onPass}>
          Pass
        </SecondaryButton>
      </div>

      {isActionPickerOpen ? (
        <section className="play-turn-action-picker" aria-label="Choose a turn action">
          <div className="play-turn-action-picker-header">
            <h3>Choose Your Action</h3>
            <button type="button" className="play-turn-action-picker-close" onClick={onCancelActionPicker}>
              Cancel
            </button>
          </div>
          <div className="play-turn-action-picker-group">
            <p className="play-turn-action-picker-group-title">Regular Actions</p>
            <div className="play-turn-action-picker-grid">
              {regularActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="play-turn-action-option"
                  onClick={() => onActionPick(action.id)}
                  disabled={isAdvancingTurn}
                >
                  <strong>{action.label}</strong>
                  <span>{action.description}</span>
                </button>
              ))}
            </div>
          </div>

          {advancedActions.length > 0 ? (
            <div className="play-turn-action-picker-group">
              <p className="play-turn-action-picker-group-title">Advanced Action</p>
              <div className="play-turn-action-picker-grid">
                {advancedActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="play-turn-action-option is-advanced"
                    onClick={() => onActionPick(action.id)}
                    disabled={isAdvancingTurn}
                  >
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {unexpectedActions.length > 0 ? (
            <div className="play-turn-action-picker-group">
              <p className="play-turn-action-picker-group-title">Unexpected Issues</p>
              <div className="play-turn-action-picker-grid">
                {unexpectedActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="play-turn-action-option is-unexpected"
                    onClick={() => onActionPick(action.id)}
                    disabled={isAdvancingTurn}
                  >
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  )
}

export default PlayGamePage
