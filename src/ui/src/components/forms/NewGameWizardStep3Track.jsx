const NewGameWizardStep3Track = ({ tracks, selectedTrackKey, onSelectTrack }) => (
  <section className="wizard-step">
    <h3 className="wizard-title">Pick Education Track</h3>
    <p className="wizard-subtitle">Track choice determines available jobs in the next step.</p>

    <div className="wizard-choice-grid" role="list" aria-label="Track options">
      {tracks.map((track) => {
        const isSelected = track.key === selectedTrackKey
        return (
          <button
            key={track.key}
            type="button"
            role="listitem"
            className={`wizard-choice-card${isSelected ? ' wizard-choice-card-selected' : ''}`}
            aria-pressed={isSelected}
            onClick={() => onSelectTrack(track.key)}
          >
            <span className="wizard-choice-title">{track.label}</span>
            <span className="wizard-choice-detail">{track.detail}</span>
          </button>
        )
      })}
    </div>
  </section>
)

export default NewGameWizardStep3Track
