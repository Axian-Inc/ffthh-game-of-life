const NewGameWizardStep2City = ({ cityOptions, selectedCityId, onSelectCity }) => (
  <div className="wizard-step wizard-step-rail" data-step="3">
    <div className="wizard-card-rail wizard-card-rail-city">
      {cityOptions.map((city) => {
        const selected = city.id === selectedCityId
        return (
          <button
            key={city.id}
            type="button"
            className={`wizard-rail-card ${selected ? 'is-selected' : ''}`}
            onClick={() => onSelectCity(city.id)}
          >
            <div className="wizard-rail-card-header">
              <span className="wizard-rail-icon" aria-hidden="true">
                {city.icon}
              </span>
              <h3>{city.label}</h3>
            </div>

            <div className="wizard-info-band wizard-info-band-green">
              <h4>Cost</h4>
              {city.cost.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="wizard-info-band wizard-info-band-blue">
              <h4>Opportunity</h4>
              {city.opportunity.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="wizard-info-band wizard-info-band-purple">
              <h4>Wellbeing</h4>
              {city.wellbeing.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <p className="wizard-card-copy">{city.body}</p>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep2City
