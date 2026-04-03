import { ChevronLeft, ChevronRight } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import { PLAY_TURN_PLACEHOLDER } from '../../data/playTurnPlaceholder'
import './play-game-page.css'

const noop = () => {}

const PlayGamePage = ({
  onPreviousPlayer = noop,
  onNextPlayer = noop,
  onSeeHistory = noop,
  onChooseAction = noop,
  onPass = noop,
}) => (
  <section aria-label="Player turn placeholder" className="play-turn-page">
    <header className="play-turn-header">
      <h2 className="play-turn-title">{PLAY_TURN_PLACEHOLDER.turnTitle}</h2>
      <p className="play-turn-subtitle">{PLAY_TURN_PLACEHOLDER.activePlayerLabel}</p>
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

      <ul className="play-turn-player-list">
        {PLAY_TURN_PLACEHOLDER.players.map((player) => (
          <li className="play-turn-player" key={player.id}>
            <div
              className={`play-turn-player-card ${player.isActive ? 'is-active' : ''}`.trim()}
            >
              <img alt={player.portraitAlt} src={player.portraitSrc} />
            </div>
            <span className="play-turn-player-name">{player.name}</span>
          </li>
        ))}
      </ul>

      <button aria-label="Next player" className="play-turn-chevron" onClick={onNextPlayer} type="button">
        <ChevronRight aria-hidden="true" />
      </button>
    </div>

    <div className="play-turn-status-card">
      <section className="play-turn-status-column" aria-label="Financial overview">
        {PLAY_TURN_PLACEHOLDER.financialStats.map((item) => (
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
        {PLAY_TURN_PLACEHOLDER.statusStats.map((item) =>
          item.kind === 'meter' ? (
            <div className="play-turn-stat-row play-turn-stat-row-meter" key={item.id}>
              <span className="play-turn-stat-icon" aria-hidden="true">
                <img alt="" src={item.iconSrc} />
              </span>
              <div className="play-turn-stat-copy">
                <p className="play-turn-stat-label play-turn-stat-label-inline">{item.label}</p>
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
        {PLAY_TURN_PLACEHOLDER.modifierGroups.map((group) => (
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
      <PrimaryButton className="play-turn-action-primary" onClick={onChooseAction}>
        Choose Action
      </PrimaryButton>
      <SecondaryButton className="play-turn-action-muted" onClick={onPass}>
        Pass
      </SecondaryButton>
    </div>
  </section>
)

export default PlayGamePage
