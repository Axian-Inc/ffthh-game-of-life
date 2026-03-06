import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import { WIZARD_CITY_OPTIONS } from '../../data/wizardVisualCatalog'

const NewGameWizardStep2City = ({ selectedCityId, onSelectCity, onBack, onNext }) => (
  <div className="wizard-step" data-step="3">
    <header className="wizard-heading">
      <h2 className="wizard-title">New Player Setup - Pick City</h2>
      <p className="wizard-subtitle">Step 3 of 6</p>
    </header>
    <div className="wizard-rail wizard-rail-cities">
      {WIZARD_CITY_OPTIONS.map((city) => (
        <button
          key={city.id}
          type="button"
          className={`wizard-card wizard-city-card ${selectedCityId === city.id ? 'is-selected' : ''}`}
          onClick={() => onSelectCity(city.id)}
        >
          <div className="wizard-city-header">
            <span className="wizard-badge">{city.badge}</span>
            <h3>{city.label}</h3>
          </div>
          <div className="wizard-stat-block wizard-stat-green">
            <strong>{city.costLabel}</strong>
            {city.costItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="wizard-stat-block wizard-stat-blue">
            <strong>{city.opportunityLabel}</strong>
            {city.opportunityItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="wizard-stat-block wizard-stat-purple">
            <strong>{city.wellbeingLabel}</strong>
            {city.wellbeingItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p className="wizard-card-copy">{city.description}</p>
        </button>
      ))}
    </div>
    <footer className="wizard-footer">
      <SecondaryButton className="wizard-secondary-button" onClick={onBack}>
        Back
      </SecondaryButton>
      <PrimaryButton className="wizard-pill-button" disabled={!selectedCityId} onClick={onNext}>
        Next
      </PrimaryButton>
    </footer>
  </div>
)

export default NewGameWizardStep2City
