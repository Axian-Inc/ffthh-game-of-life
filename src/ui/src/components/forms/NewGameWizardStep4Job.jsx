const NewGameWizardStep4Job = ({ selectedTrack, jobs, selectedJobKey, onSelectJob }) => (
  <section className="wizard-step">
    <h3 className="wizard-title">Pick Job</h3>
    <p className="wizard-subtitle">
      {selectedTrack ? `Available for ${selectedTrack.label}` : 'Choose a track first to view jobs.'}
    </p>

    {selectedTrack ? (
      <div className="wizard-choice-grid" role="list" aria-label="Job options">
        {jobs.map((job) => {
          const jobKey = job.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          const isSelected = jobKey === selectedJobKey
          return (
            <button
              key={job}
              type="button"
              role="listitem"
              className={`wizard-choice-card${isSelected ? ' wizard-choice-card-selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => onSelectJob(jobKey)}
            >
              <span className="wizard-choice-title">{job}</span>
              <span className="wizard-choice-detail">{selectedTrack.detail}</span>
            </button>
          )
        })}
      </div>
    ) : (
      <p className="wizard-muted">Select a track to unlock jobs.</p>
    )}
  </section>
)

export default NewGameWizardStep4Job
