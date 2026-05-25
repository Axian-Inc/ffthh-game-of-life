import { ArrowRight } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import { DIFFICULTY_PRESETS, WORLD_SETTING_OPTIONS } from '../../simulation/definitions'

const NewGameWizardStep1GameName = ({
  gameName,
  onGameNameChange,
  difficultyMode,
  onDifficultyModeChange,
  worldSettings,
  onWorldSettingChange,
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

      <label className="wizard-select-label" htmlFor="wizard-difficulty-mode">
        <span>Difficulty</span>
        <select
          id="wizard-difficulty-mode"
          className="wizard-text-input wizard-select-input"
          value={difficultyMode}
          onChange={(event) => onDifficultyModeChange(event.target.value)}
          aria-label="Difficulty"
        >
          {['easy', 'normal', 'hard', 'custom'].map((mode) => (
            <option key={mode} value={mode}>
              {DIFFICULTY_PRESETS[mode]?.label || (mode.charAt(0).toUpperCase() + mode.slice(1))}
            </option>
          ))}
        </select>
      </label>

      {difficultyMode === 'custom' ? (
        <div className="wizard-custom-settings" aria-label="Custom settings">
          {Object.entries(WORLD_SETTING_OPTIONS).map(([settingId, options]) => (
            <label className="wizard-select-label" htmlFor={`wizard-setting-${settingId}`} key={settingId}>
              <span>{settingId.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase())}</span>
              <select
                id={`wizard-setting-${settingId}`}
                className="wizard-text-input wizard-select-input"
                value={worldSettings[settingId]}
                onChange={(event) => onWorldSettingChange(settingId, event.target.value)}
              >
                {options.map((optionId) => (
                  <option key={optionId} value={optionId}>
                    {optionId.replace(/-/g, ' ').replace(/^./, (char) => char.toUpperCase())}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}

      <PrimaryButton className="wizard-action-button" onClick={onNext} disabled={isNextDisabled}>
        Next <ArrowRight aria-hidden="true" />
      </PrimaryButton>
    </div>
  )
}

export default NewGameWizardStep1GameName
