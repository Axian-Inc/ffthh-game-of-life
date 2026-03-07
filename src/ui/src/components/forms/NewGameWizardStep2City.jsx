import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const NewGameWizardStep2City = ({ options, selectedCityId, activePlayerName, onSelect, onBack, onNext }) => (
  <div className="wizard-step wizard-step-choice">
    <p className="wizard-player-context">Configuring: {activePlayerName || 'Player'}</p>
    <div className="wizard-card-rail" role="radiogroup" aria-label="City options">
      {options.map((city, index) => {
        const selected = city.id === selectedCityId
        return (
          <article
            key={city.id}
            className={`wizard-choice-card rail-${index + 1} ${selected ? 'is-selected' : ''}`}
            onClick={() => onSelect(city.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(city.id)
              }
            }}
            role="radio"
            tabIndex={0}
            aria-checked={selected}
            aria-label={city.title}
          >
            <img src={city.art} alt="" aria-hidden="true" className="wizard-choice-art" />
            <h3>{city.title}</h3>
            <p className="wizard-choice-kicker">{city.kicker}</p>
            <p>{city.description}</p>
            <ul>
              {city.facts.map((fact) => (
                <li key={`${city.id}-${fact}`}>{fact}</li>
              ))}
            </ul>
          </article>
        )
      })}
    </div>
    <div className="wizard-footer-row">
      <SecondaryButton onClick={onBack}>Back</SecondaryButton>
      <PrimaryButton onClick={onNext} disabled={!selectedCityId}>
        Next
      </PrimaryButton>
    </div>
  </div>
)

export default NewGameWizardStep2City
