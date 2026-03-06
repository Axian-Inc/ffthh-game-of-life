import { wizardCities, wizardSectionStyles } from '../../data/wizardVisualCatalog'

const cityCards = Object.values(wizardCities)

const NewGameWizardStep2City = ({ selectedCityId, onSelect }) => (
  <div className="wizard-step wizard-step-rail" data-step="2">
    <div className="wizard-card-rail wizard-card-rail-overhang" aria-label="Choose your city">
      {cityCards.map((city, index) => {
        const isSelected = city.id === selectedCityId
        return (
          <button
            key={city.id}
            type="button"
            className={`wizard-choice-card wizard-choice-card-city wizard-rail-position-${index} ${
              isSelected ? 'is-selected' : ''
            }`}
            aria-pressed={isSelected}
            onClick={() => onSelect(city.id)}
          >
            <div className="wizard-choice-header">
              <img alt="" aria-hidden="true" src={city.asset} className="wizard-choice-icon" />
              <h3>{city.title}</h3>
            </div>
            {['Cost', 'Opportunity', 'Wellbeing'].map((section) => {
              const sectionLines = city.lines.filter((line) => line.section === section)
              const sectionStyle = wizardSectionStyles[section]
              return (
                <div key={`${city.id}-${section}`} className="wizard-choice-section">
                  <div className={`wizard-choice-bar ${sectionStyle.className}`}>{section}</div>
                  <ul>
                    {sectionLines.map((line) => (
                      <li key={line.text}>
                        <span className={`wizard-stat-pill ${sectionStyle.iconClassName}`}>{line.icon}</span>
                        <span>{line.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            <p className="wizard-choice-copy">{city.description}</p>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep2City
