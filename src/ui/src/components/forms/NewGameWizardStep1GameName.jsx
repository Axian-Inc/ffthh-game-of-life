import PrimaryButton from '../ui/PrimaryButton'

const NewGameWizardStep1GameName = ({ gameName, onGameNameChange, onNext, canAdvance }) => (
  <div className="wizard-step-panel wizard-step-panel-narrow">
    <label className="wizard-field-stack" htmlFor="wizard-game-name">
      <span className="wizard-field-label">Game Name:</span>
      <input
        id="wizard-game-name"
        className="wizard-text-input"
        type="text"
        placeholder="Family Game Night"
        value={gameName}
        onChange={(event) => onGameNameChange(event.target.value)}
      />
    </label>
    <div className="wizard-footer wizard-footer-center">
      <PrimaryButton className="wizard-pill-button" disabled={!canAdvance} onClick={onNext}>
        Next
      </PrimaryButton>
    </div>
  </div>
)

export default NewGameWizardStep1GameName
