import SecondaryButton from '../ui/SecondaryButton'
import PrimaryButton from '../ui/PrimaryButton'

const NewGameWizardStep3Track = ({
  tracks,
  selectedTrackId,
  onBack,
  onSelectTrack,
  onNext,
  canAdvance,
}) => (
  <div className="wizard-step-panel wizard-step-panel-wide">
    <div className="wizard-card-rail">
      {tracks.map((track, index) => {
        const isSelected = track.id === selectedTrackId
        const positionClass = index === 0 ? 'is-left' : index === 1 ? 'is-center' : 'is-right'
        return (
          <button
            key={track.id}
            type="button"
            aria-label={track.title}
            className={`wizard-option-card ${positionClass} ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onSelectTrack(track.id)}
          >
            <div className="wizard-option-card-header">
              <img alt="" className="wizard-option-art wizard-option-art-small" src={track.artSrc} />
              <h3>{track.title}</h3>
            </div>
            {track.sections.map((section) => (
              <section key={`${track.id}-${section.title}`} className={`wizard-section-block is-${section.tone}`}>
                <h4>{section.title}</h4>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
            <p className="wizard-card-copy">{track.description}</p>
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

export default NewGameWizardStep3Track
