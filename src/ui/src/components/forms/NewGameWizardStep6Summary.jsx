const NewGameWizardStep6Summary = ({
  gameName,
  maxGameNameLength,
  gameNameError,
  players,
  citiesById,
  tracksById,
  jobsById,
  onGameNameChange,
  onGameNameBlur,
  onBack,
  onNewPlayer,
  onStartGame,
  canStartGame,
}) => (
  <>
    <div className="wizard-step-body wizard-step-6" data-testid="wizard-step-6">
      <div className="wizard-summary-sheet">
        <label className="wizard-summary-name" htmlFor="game-name-summary">
          <span>Game Name:</span>
          <input
            id="game-name-summary"
            type="text"
            value={gameName}
            maxLength={maxGameNameLength}
            onChange={onGameNameChange}
            onBlur={onGameNameBlur}
            aria-invalid={Boolean(gameNameError)}
          />
        </label>
        {gameNameError ? <p className="field-error">{gameNameError}</p> : null}

        <div className="wizard-summary-rows">
          {players.map((player) => (
            <article key={player.id} className="wizard-summary-row">
              <h3>{player.name}</h3>
              <p>
                <strong>City:</strong> {citiesById[player.cityId]?.title}
              </p>
              <p>
                <strong>Education:</strong> {tracksById[player.educationTrackId]?.title}
              </p>
              <p>
                <strong>Job:</strong> {jobsById[player.jobId]?.title}
              </p>
              <p>
                <strong>Income:</strong> {jobsById[player.jobId]?.income}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
    <div className="wizard-footer wizard-footer-summary">
      <button className="wizard-button wizard-button-secondary" onClick={onBack} type="button">
        Back
      </button>
      <button className="wizard-button wizard-button-secondary" onClick={onNewPlayer} type="button">
        + New Player
      </button>
      <button
        aria-label={`Start Game with ${players.length} Player${players.length === 1 ? '' : 's'}`}
        className="wizard-button wizard-button-primary"
        disabled={!canStartGame}
        onClick={onStartGame}
        type="button"
      >
        Start Game
      </button>
    </div>
  </>
)

export default NewGameWizardStep6Summary
