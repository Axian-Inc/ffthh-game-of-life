import { WIZARD_CITY_OPTIONS } from '../../data/wizardVisualCatalog'

const NewGameWizardStep2City = ({ selectedCityId, onSelectCity }) => (
  <div className="wizard-step" data-step="3">
    <div className="wizard-rail wizard-rail-cards">
      {WIZARD_CITY_OPTIONS.map((city) => {
        const isSelected = city.id === selectedCityId
        return (
          <button
            key={city.id}
            type="button"
            className={`wizard-option-card wizard-city-card${isSelected ? ' is-selected' : ''}`}
            onClick={() => onSelectCity(city.id)}
            aria-pressed={isSelected}
          >
            <h3>{city.name}</h3>
            <p>{city.blurb}</p>
            <p className="wizard-meta">{city.costOfLiving}</p>
            <p className="wizard-meta">{city.modifier}</p>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep2City
