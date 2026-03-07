import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'

const NewGameWizardStep6Summary = ({
  gameName,
  maxGameNameLength,
  gameNameTouched,
  gameNameError,
  isGameNameValid,
  players,
  playerSummaries,
  canStart,
  isCreating,
  onGameNameChange,
  onGameNameBlur,
  onBack,
  onAddNewPlayer,
  onStart,
}) => (
  <div className="wizard-step wizard-step-summary">
    <div className="wizard-summary-sheet">
      <label className="wizard-summary-title-row" htmlFor="wizard-summary-game-name">
        <span>Game Name:</span>
        <input
          id="wizard-summary-game-name"
          className="wizard-input wizard-summary-name"
          type="text"
          value={gameName}
          maxLength={maxGameNameLength}
          onChange={onGameNameChange}
          onBlur={onGameNameBlur}
          aria-invalid={!isGameNameValid && gameNameTouched}
          disabled={isCreating}
        />
      </label>
      {gameNameTouched && gameNameError ? (
        <p className="wizard-error" role="alert">
          {gameNameError}
        </p>
      ) : null}

      <ul className="wizard-summary-players" aria-label="Player Setup Summary">
        {players.map((player) => {
          const summary = playerSummaries[player.id]
          return (
            <li key={player.id} className="wizard-summary-player-row">
              <div className="wizard-summary-player-main">
                <PlayerAvatar avatar={player.avatar} decorative className="wizard-summary-player-avatar" />
                <div>
                  <h3>{player.name}</h3>
                  <p>{summary.city || 'City not set'}</p>
                </div>
              </div>
              <div className="wizard-summary-player-meta">
                <p>{summary.education || 'Education not set'}</p>
                <p>{summary.job || 'Career not set'}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>

    <div className="wizard-footer-row wizard-summary-actions">
      <SecondaryButton onClick={onBack} disabled={isCreating}>
        Back
      </SecondaryButton>
      <SecondaryButton className="wizard-add-player" onClick={onAddNewPlayer} disabled={isCreating}>
        + New Player
      </SecondaryButton>
      <PrimaryButton onClick={onStart} disabled={!canStart || isCreating}>
        {isCreating ? 'Creating...' : 'Start Game'}
      </PrimaryButton>
    </div>
  </div>
)

export default NewGameWizardStep6Summary
