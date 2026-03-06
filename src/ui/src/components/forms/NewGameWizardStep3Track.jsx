import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import { WIZARD_TRACK_OPTIONS } from '../../data/wizardVisualCatalog'

const NewGameWizardStep3Track = ({ selectedTrackId, onSelectTrack, onBack, onNext }) => (
  <div className="wizard-step" data-step="4">
    <header className="wizard-heading">
      <h2 className="wizard-title">New Player Setup - Education Track</h2>
      <p className="wizard-subtitle">Step 4 of 6</p>
    </header>
    <div className="wizard-rail wizard-rail-tracks">
      {WIZARD_TRACK_OPTIONS.map((track) => (
        <button
          key={track.id}
          type="button"
          className={`wizard-card wizard-track-card ${selectedTrackId === track.id ? 'is-selected' : ''}`}
          onClick={() => onSelectTrack(track.id)}
        >
          <div className="wizard-track-header">
            <img alt="" aria-hidden="true" src={track.iconSrc} />
            <h3>{track.label}</h3>
          </div>
          <div className="wizard-stat-block wizard-stat-green">
            <strong>{track.debtLabel}</strong>
            {track.debtItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="wizard-stat-block wizard-stat-blue">
            <strong>{track.potentialLabel}</strong>
            {track.potentialItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="wizard-stat-block wizard-stat-purple">
            <strong>{track.stabilityLabel}</strong>
            {track.stabilityItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p className="wizard-card-copy">{track.description}</p>
        </button>
      ))}
    </div>
    <footer className="wizard-footer">
      <SecondaryButton className="wizard-secondary-button" onClick={onBack}>
        Back
      </SecondaryButton>
      <PrimaryButton className="wizard-pill-button" disabled={!selectedTrackId} onClick={onNext}>
        Next
      </PrimaryButton>
    </footer>
  </div>
)

export default NewGameWizardStep3Track
