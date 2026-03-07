const NewGameWizardStep4Job = ({ jobOptions, selectedJobId, onSelectJob }) => (
  <div className="wizard-step wizard-step-rail" data-step="5">
    <div className="wizard-card-rail wizard-card-rail-job">
      {jobOptions.map((job) => {
        const selected = job.id === selectedJobId
        return (
          <button
            key={job.id}
            type="button"
            className={`wizard-rail-card wizard-job-card ${selected ? 'is-selected' : ''}`}
            onClick={() => onSelectJob(job.id)}
          >
            <img className="wizard-job-art" src={job.art} alt="" />
            <div className="wizard-job-title-block">
              <h3>{job.label}</h3>
            </div>

            <div className="wizard-info-band wizard-info-band-gold">
              <h4>Income</h4>
              <p>{job.income}</p>
            </div>

            <div className="wizard-info-band wizard-info-band-blue">
              <h4>Stability</h4>
              <p>{job.stability}</p>
            </div>

            <div className="wizard-info-band wizard-info-band-orange">
              <h4>Wage Growth</h4>
              <p>{job.wageGrowth}</p>
            </div>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep4Job
