const NewGameWizardStep3Track = ({ tracks, selectedTrackId, onSelectTrack, isCreating }) => (
  <div className="wizard-step-content">
    <div className="wizard-choice-grid wizard-choice-grid-3" role="group" aria-label="Pick an education track">
      {tracks.map((track) => {
        const isSelected = selectedTrackId === track.id
        return (
          <button
            key={track.id}
            type="button"
            className={`wizard-choice-card ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onSelectTrack(track.id)}
            disabled={isCreating}
            aria-pressed={isSelected}
          >
            <div className="wizard-card-title-row">
              <span className="wizard-token">{track.iconToken}</span>
              <h3>{track.name}</h3>
            </div>
            <div className="wizard-card-section">
              <p className="wizard-section-label">Debt/Investment</p>
              <p>{track.debtInvestment}</p>
            </div>
            <div className="wizard-card-section">
              <p className="wizard-section-label">Long-Term Potential</p>
              <p>{track.longTermPotential}</p>
            </div>
            <div className="wizard-card-section">
              <p className="wizard-section-label">Stability</p>
              <p>{track.stability}</p>
            </div>
            <p className="wizard-card-description">{track.description}</p>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep3Track
