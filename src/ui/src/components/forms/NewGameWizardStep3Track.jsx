const NewGameWizardStep3Track = ({ trackOptions, selectedTrackId, onSelectTrack, onBack, onNext }) => (
  <>
    <div className="wizard-step-body" data-testid="wizard-step-4">
      <div className="wizard-card-rail">
        {trackOptions.map((track) => {
          const isSelected = track.id === selectedTrackId
          return (
            <button
              key={track.id}
              type="button"
              className={`wizard-rail-card ${isSelected ? 'wizard-rail-card-selected' : ''}`}
              onClick={() => onSelectTrack(track.id)}
            >
              <h3>{track.title}</h3>
              <p>{track.copy}</p>
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

export default NewGameWizardStep3Track
