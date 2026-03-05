const NewGameWizardStep2City = ({ cities, selectedCityKey, onSelectCity }) => (
  <section className="wizard-step">
    <h3 className="wizard-title">Pick City</h3>
    <p className="wizard-subtitle">Choose where this player starts their journey.</p>

    <div className="wizard-choice-grid" role="list" aria-label="City options">
      {cities.map((city) => {
        const isSelected = city.key === selectedCityKey
        return (
          <button
            key={city.key}
            type="button"
            role="listitem"
            className={`wizard-choice-card${isSelected ? ' wizard-choice-card-selected' : ''}`}
            aria-pressed={isSelected}
            onClick={() => onSelectCity(city.key)}
          >
            <span className="wizard-choice-title">{city.label}</span>
            <span className="wizard-choice-detail">{city.detail}</span>
          </button>
        )
      })}
    </div>
  </section>
)

export default NewGameWizardStep2City
