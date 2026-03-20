import { ArrowRight } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'

const NewGameWizardStep1GameName = ({
  gameName,
  onGameNameChange,
  maxGameNameLength,
  onNext,
  isNextDisabled,
}) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !isNextDisabled) {
      event.preventDefault()
      onNext()
    }
  }

  return (
    <div className="wizard-step wizard-step-game-name" data-step="1">
      <input
        id="wizard-game-name-input"
        className="wizard-text-input"
        type="text"
        value={gameName}
        maxLength={maxGameNameLength}
        onChange={(event) => onGameNameChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. Family Game Night"
        aria-label="Game name"
        data-autofocus="true"
      />
      <PrimaryButton className="wizard-action-button" onClick={onNext} disabled={isNextDisabled}>
        Next <ArrowRight aria-hidden="true" />
      </PrimaryButton>
    </div>
  )
}

export default NewGameWizardStep1GameName
