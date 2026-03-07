import { WIZARD_CITIES, WIZARD_STAT_SECTIONS } from '../../data/wizardVisualCatalog'

const NewGameWizardStep2City = ({ selectedCityId, disabled, onSelect }) => (
  <div className="wizard-step wizard-step-rail">
    <div className="wizard-card-rail wizard-city-rail">
      {WIZARD_CITIES.map((city) => (
        <button
          key={city.id}
          className={`wizard-choice-card ${selectedCityId === city.id ? 'is-selected' : ''}`}
          disabled={disabled}
          onClick={() => onSelect(city.id)}
          type="button"
        >
          <div className="wizard-choice-title">
            <img alt="" aria-hidden="true" className="wizard-choice-icon" src={city.art} />
            <h3>{city.title}</h3>
          </div>
          {WIZARD_STAT_SECTIONS.city.map((section) => (
            <section className={`wizard-stat-panel panel-${section.color}`} key={section.key}>
              <header>
                <img alt="" aria-hidden="true" src={section.icon} />
                <span>{section.label}</span>
              </header>
              <ul>
                {city[section.key].map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
          <p className="wizard-choice-copy">{city.description}</p>
        </button>
      ))}
    </div>
  </div>
)

export default NewGameWizardStep2City
