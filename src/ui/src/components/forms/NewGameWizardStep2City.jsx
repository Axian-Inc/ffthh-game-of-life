const NewGameWizardStep2City = ({ cityOptions, selectedCityId, onSelectCity, onBack, onNext }) => (
  <>
    <div className="wizard-step-body" data-testid="wizard-step-3">
      <div className="wizard-card-rail">
        {cityOptions.map((city) => {
          const isSelected = city.id === selectedCityId
          return (
            <button
              key={city.id}
              type="button"
              className={`wizard-rail-card ${isSelected ? 'wizard-rail-card-selected' : ''}`}
              onClick={() => onSelectCity(city.id)}
            >
              <h3>{city.title}</h3>
              <p className="wizard-card-tagline">{city.tagline}</p>
              <p>{city.copy}</p>
            </button>
          )
        })}
      </div>
    </div>
    <div className="wizard-footer">
      <button className="wizard-button wizard-button-secondary" onClick={onBack} type="button">
        Back
      </button>
      <button className="wizard-button wizard-button-primary" onClick={onNext} type="button">
        Next
      </button>
    </div>
  </>
)

export default NewGameWizardStep2City
