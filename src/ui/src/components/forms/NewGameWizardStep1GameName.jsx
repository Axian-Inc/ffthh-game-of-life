import PrimaryButton from '../ui/PrimaryButton'

const NewGameWizardStep1GameName = ({
  gameName,
  isGameNameValid,
  isGameNameTooLong,
  maxGameNameLength,
  onGameNameChange,
  onGameNameBlur,
  onNext,
}) => (
  <div className="wizard-step wizard-step-intro" data-step="1">
    <header className="wizard-heading">
      <h2 className="wizard-title">New Game Setup</h2>
      <p className="wizard-subtitle">Step 1 of 6</p>
    </header>
    <div className="wizard-step1-body">
      <label className="wizard-field" htmlFor="wizard-game-name">
        <span>Game Name:</span>
        <input
          id="wizard-game-name"
          type="text"
          value={gameName}
          maxLength={maxGameNameLength}
          placeholder="Family Game Night"
          onChange={onGameNameChange}
          onBlur={onGameNameBlur}
          aria-invalid={Boolean(gameName) && (!isGameNameValid || isGameNameTooLong)}
        />
      </label>
      <PrimaryButton className="wizard-center-button" disabled={!isGameNameValid} onClick={onNext}>
        Next
      </PrimaryButton>
    </div>
  </div>
)

export default NewGameWizardStep1GameName
