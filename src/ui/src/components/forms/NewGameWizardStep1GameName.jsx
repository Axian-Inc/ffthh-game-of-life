const NewGameWizardStep1GameName = ({
  gameName,
  maxGameNameLength,
  error,
  disabled,
  onChange,
}) => (
  <div className="wizard-step wizard-step-game-name">
    <label className="wizard-field wizard-name-field" htmlFor="wizard-game-name">
      <span className="wizard-field-label">Game Name:</span>
      <input
        id="wizard-game-name"
        className="wizard-text-input"
        disabled={disabled}
        maxLength={maxGameNameLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Choices Matter"
        type="text"
        value={gameName}
      />
    </label>
    {error ? (
      <p className="wizard-inline-error" role="alert">
        {error}
      </p>
    ) : null}
  </div>
)

export default NewGameWizardStep1GameName
