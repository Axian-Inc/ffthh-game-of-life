import { ArrowRight } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import { WIZARD_EDUCATION_TRACKS } from '../../data/wizardVisualCatalog'

const NewGameWizardStep3Track = ({ selectedTrackId, onSelectTrack, onNext, isNextDisabled }) => (
  <div className="wizard-step" data-step="4">
    <div className="wizard-choice-list">
      {WIZARD_EDUCATION_TRACKS.map((track) => {
        const isSelected = track.id === selectedTrackId
        return (
          <button
            key={track.id}
            type="button"
            className={`wizard-choice-card${isSelected ? ' is-selected' : ''}`}
            onClick={() => onSelectTrack(track.id)}
            aria-pressed={isSelected}
          >
            <div className="wizard-choice-title-row">
              <span className="wizard-choice-icon" aria-hidden="true">
                {track.icon}
              </span>
              <div>
                <h3>{track.name}</h3>
                <p>{track.blurb}</p>
              </div>
            </div>
            <div className="wizard-inline-metrics">
              {track.modifiers.map((modifier) => (
                <span key={modifier}>{modifier}</span>
              ))}
            </div>
          </button>
        )
      })}
    </div>
    <PrimaryButton className="wizard-action-button" onClick={onNext} disabled={isNextDisabled}>
      Next <ArrowRight aria-hidden="true" />
    </PrimaryButton>
  </div>
)

export default NewGameWizardStep3Track
