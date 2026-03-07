const NewGameWizardStep1GameName = ({
  gameName,
  maxGameNameLength,
  gameNameError,
  onGameNameChange,
  onGameNameBlur,
  onNext,
  isNextDisabled,
}) => (
  <>
    <div className="wizard-step-body wizard-step-1" data-testid="wizard-step-1">
      <label className="wizard-field" htmlFor="game-name">
        <span className="wizard-label">Game Name:</span>
        <input
          id="game-name"
          type="text"
          value={gameName}
          maxLength={maxGameNameLength}
          onChange={onGameNameChange}
          onBlur={onGameNameBlur}
          placeholder="Family Game Night"
          aria-invalid={Boolean(gameNameError)}
        />
      </label>
      {gameNameError ? <p className="field-error">{gameNameError}</p> : null}
    </div>
    <div className="wizard-footer wizard-footer-centered">
      <button className="wizard-button wizard-button-primary" disabled={isNextDisabled} onClick={onNext} type="button">
        Next
      </button>
    </div>
  </>
)

export default NewGameWizardStep1GameName
