import { ArrowRight } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import { WIZARD_CITY_OPTIONS } from '../../data/wizardVisualCatalog'

const NewGameWizardStep2City = ({ selectedCityId, onSelectCity, onNext, isNextDisabled }) => (
  <div className="wizard-step" data-step="3">
    <div className="wizard-choice-list">
      {WIZARD_CITY_OPTIONS.map((city) => {
        const isSelected = city.id === selectedCityId
        return (
          <button
            key={city.id}
            type="button"
            className={`wizard-choice-card${isSelected ? ' is-selected' : ''}`}
            onClick={() => onSelectCity(city.id)}
            aria-pressed={isSelected}
          >
            <div className="wizard-choice-title-row">
              <span className="wizard-choice-icon" aria-hidden="true">
                {city.icon}
              </span>
              <div>
                <h3>{city.shortName}</h3>
                <p>{city.blurb}</p>
              </div>
            </div>
            <div className="wizard-inline-metrics">
              {city.modifiers.map((modifier) => (
                <span key={modifier}>{modifier}</span>
              ))}
            </div>
          </button>
        )
      })}
    </div>
    <PrimaryButton className="wizard-action-button" onClick={onNext} disabled={isNextDisabled}>
      Next <ArrowRight aria-hidden="true" />
    </PrimaryButton>
  </div>
)

export default NewGameWizardStep2City
