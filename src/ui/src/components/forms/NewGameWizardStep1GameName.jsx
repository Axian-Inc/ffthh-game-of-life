const NewGameWizardStep1GameName = ({ gameName, onGameNameChange, maxGameNameLength, onNext, isNextDisabled }) => (
  <div className="wizard-step wizard-step-game-name" data-step="1">
    <label className="wizard-field" htmlFor="wizard-game-name-input">
      <span className="wizard-field-label">Game Name:</span>
      <input
        id="wizard-game-name-input"
        className="wizard-text-input"
        type="text"
        value={gameName}
        maxLength={maxGameNameLength}
        onChange={(event) => onGameNameChange(event.target.value)}
        placeholder="Family Game Night"
      />
    </label>
    <div className="wizard-center-actions">
      <button type="button" className="primary-action wizard-pill" onClick={onNext} disabled={isNextDisabled}>
        Next
      </button>
    </div>
  </div>
)

export default NewGameWizardStep1GameName
