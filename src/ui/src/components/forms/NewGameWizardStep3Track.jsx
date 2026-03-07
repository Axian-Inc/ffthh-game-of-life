import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const NewGameWizardStep3Track = ({
  options,
  selectedEducationTrackId,
  activePlayerName,
  onSelect,
  onBack,
  onNext,
}) => (
  <div className="wizard-step wizard-step-choice">
    <p className="wizard-player-context">Configuring: {activePlayerName || 'Player'}</p>
    <div className="wizard-card-rail" role="radiogroup" aria-label="Education track options">
      {options.map((track, index) => {
        const selected = track.id === selectedEducationTrackId
        return (
          <article
            key={track.id}
            className={`wizard-choice-card rail-${index + 1} ${selected ? 'is-selected' : ''}`}
            onClick={() => onSelect(track.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(track.id)
              }
            }}
            role="radio"
            tabIndex={0}
            aria-checked={selected}
            aria-label={track.title}
          >
            <img src={track.art} alt="" aria-hidden="true" className="wizard-choice-art" />
            <h3>{track.title}</h3>
            <p className="wizard-choice-kicker">{track.kicker}</p>
            <p>{track.description}</p>
            <ul>
              {track.facts.map((fact) => (
                <li key={`${track.id}-${fact}`}>{fact}</li>
              ))}
            </ul>
          </article>
        )
      })}
    </div>
    <div className="wizard-footer-row">
      <SecondaryButton onClick={onBack}>Back</SecondaryButton>
      <PrimaryButton onClick={onNext} disabled={!selectedEducationTrackId}>
        Next
      </PrimaryButton>
    </div>
  </div>
)

export default NewGameWizardStep3Track
