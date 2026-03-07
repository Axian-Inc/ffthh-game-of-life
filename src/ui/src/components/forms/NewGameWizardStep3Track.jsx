import { WIZARD_EDUCATION_TRACKS } from '../../data/wizardVisualCatalog'

const NewGameWizardStep3Track = ({ selectedTrackId, onSelectTrack }) => (
  <div className="wizard-step" data-step="4">
    <div className="wizard-rail wizard-rail-cards">
      {WIZARD_EDUCATION_TRACKS.map((track) => {
        const isSelected = track.id === selectedTrackId
        return (
          <button
            key={track.id}
            type="button"
            className={`wizard-option-card wizard-track-card${isSelected ? ' is-selected' : ''}`}
            onClick={() => onSelectTrack(track.id)}
            aria-pressed={isSelected}
          >
            <h3>{track.name}</h3>
            <p>{track.upfront}</p>
            <p className="wizard-meta">{track.weekly}</p>
            <p className="wizard-meta">{track.risk}</p>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep3Track
