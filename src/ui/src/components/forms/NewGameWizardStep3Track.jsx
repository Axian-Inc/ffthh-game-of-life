const NewGameWizardStep3Track = ({ trackOptions, selectedTrackId, onSelectTrack }) => (
  <div className="wizard-step wizard-step-rail" data-step="4">
    <div className="wizard-card-rail wizard-card-rail-track">
      {trackOptions.map((track) => {
        const selected = track.id === selectedTrackId
        return (
          <button
            key={track.id}
            type="button"
            className={`wizard-rail-card ${selected ? 'is-selected' : ''}`}
            onClick={() => onSelectTrack(track.id)}
          >
            <div className="wizard-rail-card-header">
              <span className="wizard-rail-icon" aria-hidden="true">
                {track.icon}
              </span>
              <h3>{track.label}</h3>
            </div>

            <div className="wizard-info-band wizard-info-band-green">
              <h4>Debt/Investment</h4>
              {track.debt.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="wizard-info-band wizard-info-band-blue">
              <h4>Long-Term Potential</h4>
              {track.potential.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="wizard-info-band wizard-info-band-purple">
              <h4>Stability</h4>
              {track.stability.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <p className="wizard-card-copy">{track.body}</p>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep3Track
