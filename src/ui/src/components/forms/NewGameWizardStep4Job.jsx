import WIZARD_ART from '../../assets/wizard/art'

const NewGameWizardStep4Job = ({ jobOptions, selectedJobId, onSelectJob, onBack, onNext }) => (
  <>
    <div className="wizard-step-body" data-testid="wizard-step-5">
      <div className="wizard-card-rail">
        {jobOptions.map((job) => {
          const isSelected = job.id === selectedJobId
          const art = WIZARD_ART[job.artKey]
          return (
            <button
              key={job.id}
              type="button"
              className={`wizard-rail-card wizard-job-card ${isSelected ? 'wizard-rail-card-selected' : ''}`}
              onClick={() => onSelectJob(job.id)}
            >
              <div className="wizard-job-art" style={{ background: art.gradient }} aria-hidden="true">
                <span>{art.emoji}</span>
              </div>
              <div className="wizard-job-title-block">
                <h3>{job.title}</h3>
                <p>{job.careerTrack}</p>
              </div>
              <div className="wizard-job-card-income">
                <strong>Income</strong>
                <p>{job.income}</p>
              </div>
              <p>
                <strong>Bonus:</strong> {job.bonus}
              </p>
              <p>
                <strong>Risk:</strong> {job.risk}
              </p>
            </button>
          )
        })}
      </div>
    </div>
    <div className="wizard-footer wizard-footer-step-5">
      <button className="wizard-button wizard-button-secondary" onClick={onBack} type="button">
        Back
      </button>
      <button className="wizard-button wizard-button-primary" onClick={onNext} type="button">
        Next
      </button>
    </div>
  </>
)

export default NewGameWizardStep4Job
