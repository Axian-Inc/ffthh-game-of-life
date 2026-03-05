const NewGameWizardStep2City = ({ cities, selectedCityId, onSelectCity, isCreating }) => (
  <div className="wizard-step-content">
    <div className="wizard-choice-grid wizard-choice-grid-3" role="group" aria-label="Pick a city">
      {cities.map((city) => {
        const isSelected = selectedCityId === city.id
        return (
          <button
            key={city.id}
            type="button"
            className={`wizard-choice-card ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onSelectCity(city.id)}
            disabled={isCreating}
            aria-pressed={isSelected}
          >
            <div className="wizard-card-title-row">
              <span className="wizard-token">{city.iconToken}</span>
              <h3>{city.name}</h3>
            </div>
            <div className="wizard-card-section">
              <p className="wizard-section-label">Cost</p>
              {city.cost.map((line) => (
                <p key={`${city.id}-${line}`}>{line}</p>
              ))}
            </div>
            <div className="wizard-card-section">
              <p className="wizard-section-label">Opportunity</p>
              {city.opportunity.map((line) => (
                <p key={`${city.id}-${line}`}>{line}</p>
              ))}
            </div>
            <div className="wizard-card-section">
              <p className="wizard-section-label">Wellbeing</p>
              {city.wellbeing.map((line) => (
                <p key={`${city.id}-${line}`}>{line}</p>
              ))}
            </div>
            <p className="wizard-card-description">{city.description}</p>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep2City
