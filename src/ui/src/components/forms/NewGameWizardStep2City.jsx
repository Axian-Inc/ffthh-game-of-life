import SecondaryButton from '../ui/SecondaryButton'
import PrimaryButton from '../ui/PrimaryButton'

const NewGameWizardStep2City = ({ cities, selectedCityId, onBack, onSelectCity, onNext, canAdvance }) => (
  <div className="wizard-step-panel wizard-step-panel-wide">
    <div className="wizard-card-rail">
      {cities.map((city, index) => {
        const isSelected = city.id === selectedCityId
        const positionClass = index === 0 ? 'is-left' : index === 1 ? 'is-center' : 'is-right'
        return (
          <button
            key={city.id}
            type="button"
            aria-label={city.title}
            className={`wizard-option-card ${positionClass} ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onSelectCity(city.id)}
          >
            <div className="wizard-option-card-header">
              <img alt="" className="wizard-option-art wizard-option-art-small" src={city.artSrc} />
              <h3>{city.title}</h3>
            </div>
            {city.sections.map((section) => (
              <section key={`${city.id}-${section.title}`} className={`wizard-section-block is-${section.tone}`}>
                <h4>{section.title}</h4>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
            <p className="wizard-card-copy">{city.description}</p>
          </button>
        )
      })}
    </div>
    <div className="wizard-footer wizard-footer-row">
      <SecondaryButton className="wizard-secondary-pill" onClick={onBack}>
        Back
      </SecondaryButton>
      <PrimaryButton className="wizard-pill-button" disabled={!canAdvance} onClick={onNext}>
        Next
      </PrimaryButton>
    </div>
  </div>
)

export default NewGameWizardStep2City
