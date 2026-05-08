import { ChevronLeft, ChevronRight } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import { PLAY_TURN_PLACEHOLDER } from '../../data/playTurnPlaceholder'
import {
  calculateNetWorth,
  getCareerDefinition,
  getCityDefinition,
  initializePlayerState,
  sumAssetValue,
  sumDebtBalance,
} from '../../services/simulation'
import { WEEKS_PER_MONTH } from '../../data/simulationDefinitions'
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

const formatCurrency = (value) => {
  const amount = Math.round(Number.isFinite(value) ? value : 0)
  const prefix = amount < 0 ? '-$' : '$'
  return `${prefix}${Math.abs(amount).toLocaleString()}`
}

const getPlaceholderStat = (group, id) => group.find((item) => item.id === id) || {}

const buildFinancialStats = (player) => {
  const netWorthIcon = getPlaceholderStat(PLAY_TURN_PLACEHOLDER.financialStats, 'net-worth')
  const cashIcon = getPlaceholderStat(PLAY_TURN_PLACEHOLDER.financialStats, 'cash')
  const assetsIcon = getPlaceholderStat(PLAY_TURN_PLACEHOLDER.financialStats, 'assets')
  const debtIcon = getPlaceholderStat(PLAY_TURN_PLACEHOLDER.financialStats, 'debt')

  return [
    {
      ...netWorthIcon,
      label: 'Net Worth',
      value: formatCurrency(calculateNetWorth(player)),
    },
    {
      ...cashIcon,
      label: 'Cash (Spendable)',
      value: formatCurrency(player.cash),
    },
    {
      ...assetsIcon,
      label: 'Assets & Investments',
      value: formatCurrency(sumAssetValue(player.assets)),
    },
    {
      ...debtIcon,
      label: 'Debt',
      value: formatCurrency(sumDebtBalance(player.debts)),
      tone: 'negative',
    },
  ]
}

const buildStatusStats = (player) => {
  const career = getCareerDefinition(player.careerId || player.jobId)
  const city = getCityDefinition(player.cityId)
  const jobIcon = getPlaceholderStat(PLAY_TURN_PLACEHOLDER.statusStats, 'job')
  const incomeIcon = getPlaceholderStat(PLAY_TURN_PLACEHOLDER.statusStats, 'income')
  const physicalIcon = getPlaceholderStat(PLAY_TURN_PLACEHOLDER.statusStats, 'physical-health')
  const mentalIcon = getPlaceholderStat(PLAY_TURN_PLACEHOLDER.statusStats, 'mental-health')
  const locationIcon = getPlaceholderStat(PLAY_TURN_PLACEHOLDER.statusStats, 'location')

  return [
    { ...jobIcon, label: 'Job', value: career.label },
    { ...incomeIcon, label: 'Income', value: `${formatCurrency(career.weeklyIncome * WEEKS_PER_MONTH)} / month` },
    {
      ...physicalIcon,
      label: 'Physical Health',
      value: player.physicalHealth / 100,
      displayValue: `${player.physicalHealth}/100`,
      kind: 'meter',
    },
    {
      ...mentalIcon,
      label: 'Mental Health',
      value: player.mentalHealth / 100,
      displayValue: `${player.mentalHealth}/100`,
      kind: 'meter',
    },
    { ...locationIcon, label: 'Location', value: city.label },
  ]
}

const buildModifierGroups = (player) => {
  const career = getCareerDefinition(player.careerId || player.jobId)
  const city = getCityDefinition(player.cityId)
  const choiceIcons = PLAY_TURN_PLACEHOLDER.modifierGroups[0]?.items || []
  const lifeIcons = PLAY_TURN_PLACEHOLDER.modifierGroups[1]?.items || []

  return [
    {
      id: 'career-modifiers',
      title: 'Career Modifiers',
      items: [
        {
          id: 'career-stability',
          label: `${career.stability} stability`,
          iconSrc: choiceIcons[0]?.iconSrc,
        },
        {
          id: 'career-track',
          label: `${career.trackId} track`,
          iconSrc: choiceIcons[1]?.iconSrc,
        },
        {
          id: 'switch-cost',
          label: `${formatCurrency(career.switchCost)} switch`,
          iconSrc: choiceIcons[2]?.iconSrc,
        },
      ],
    },
    {
      id: 'city-modifiers',
      title: 'City Modifiers',
      items: [
        {
          id: 'cost-of-living',
          label: `${Math.round(city.costOfLivingMultiplier * 100)}% cost`,
          iconSrc: lifeIcons[0]?.iconSrc,
        },
        {
          id: 'tax-rate',
          label: `${Math.round(city.taxRate * 100)}% tax`,
          iconSrc: lifeIcons[1]?.iconSrc,
        },
        {
          id: 'opportunity',
          label: `${Math.round(city.opportunityMultiplier * 100)}% opportunity`,
          iconSrc: lifeIcons[2]?.iconSrc,
        },
      ],
    },
  ]
}

const PlayGamePage = ({
  game,
  isAdvancingTurn = false,
  onPreviousPlayer = noop,
  onNextPlayer = noop,
  onSeeHistory = noop,
  onChooseAction = noop,
  onPass = noop,
}) => {
  const players = getPlayers(game)
  const activePlayerIndex = getActivePlayerIndex(game, players)
  const activePlayer = players[activePlayerIndex] || null
  const activePlayerState = activePlayer ? initializePlayerState(activePlayer, activePlayerIndex) : null
  const turnNumber = Number.isInteger(game?.turnNumber) && game.turnNumber > 0 ? game.turnNumber : 1
  const activePlayerName = activePlayerState?.name || 'Player'
  const financialStats = activePlayerState ? buildFinancialStats(activePlayerState) : []
  const statusStats = activePlayerState ? buildStatusStats(activePlayerState) : []
  const modifierGroups = activePlayerState ? buildModifierGroups(activePlayerState) : []

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
                  <p className="play-turn-stat-label play-turn-stat-label-inline">{`${item.label}: ${item.displayValue}`}</p>
                  <div className="play-turn-meter">
                    <span className="play-turn-meter-fill" style={{ width: `${item.value * 100}%` }} />
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
          {modifierGroups.map((group) => (
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
    </section>
  )
}

export default PlayGamePage
