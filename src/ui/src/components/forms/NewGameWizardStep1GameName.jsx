import PrimaryButton from '../ui/PrimaryButton'

const NewGameWizardStep1GameName = ({
  gameName,
  maxGameNameLength,
  isGameNameValid,
  gameNameTouched,
  gameNameError,
  isBusy,
  onGameNameChange,
  onGameNameBlur,
  onNext,
}) => (
  <div className="wizard-step wizard-step-name">
    <label className="wizard-label" htmlFor="wizard-game-name">
      Game Name:
    </label>
    <input
      id="wizard-game-name"
      className="wizard-input"
      type="text"
      value={gameName}
      maxLength={maxGameNameLength}
      placeholder="Family Game Night"
      onChange={onGameNameChange}
      onBlur={onGameNameBlur}
      aria-invalid={!isGameNameValid && gameNameTouched}
      disabled={isBusy}
    />
    {gameNameTouched && gameNameError ? (
      <p className="wizard-error" role="alert">
        {gameNameError}
      </p>
    ) : null}
    <PrimaryButton className="wizard-step-next" onClick={onNext} disabled={!isGameNameValid || isBusy}>
      Next
    </PrimaryButton>
  </div>
)

export default NewGameWizardStep1GameName
