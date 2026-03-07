const NewGameWizardStep1GameName = ({ gameName, onGameNameChange, onGameNameBlur, isGameNameValid, isCreating }) => (
  <div className="wizard-step wizard-step-1" data-step="1">
    <label className="wizard-form-label" htmlFor="game-name">
      Game Name:
    </label>
    <input
      id="game-name"
      className="wizard-input"
      maxLength={60}
      placeholder="Family Game Night"
      type="text"
      value={gameName}
      onBlur={onGameNameBlur}
      onChange={onGameNameChange}
      aria-invalid={!isGameNameValid && gameName.trim().length > 0}
      disabled={isCreating}
    />
  </div>
)

export default NewGameWizardStep1GameName
