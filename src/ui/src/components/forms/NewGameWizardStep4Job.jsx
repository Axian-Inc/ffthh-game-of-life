const formatAnnualSalary = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const NewGameWizardStep4Job = ({ jobs, selectedJobId, onSelectJob, isCreating }) => (
  <div className="wizard-step-content">
    <div className="wizard-choice-grid wizard-choice-grid-3" role="group" aria-label="Pick a career">
      {jobs.map((job) => {
        const isSelected = selectedJobId === job.id
        return (
          <button
            key={job.id}
            type="button"
            className={`wizard-choice-card wizard-job-card ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onSelectJob(job.id)}
            disabled={isCreating}
            aria-pressed={isSelected}
          >
            <div className="wizard-job-hero" aria-hidden="true">
              {job.artToken}
            </div>
            <div className="wizard-card-title-row">
              <h3>{job.name}</h3>
            </div>
            <div className="wizard-card-section">
              <p className="wizard-section-label">Income</p>
              <p>{formatAnnualSalary(job.salaryAnnual)} / yr</p>
            </div>
            <div className="wizard-card-section">
              <p className="wizard-section-label">Stability</p>
              <p>{job.stability}</p>
            </div>
            <div className="wizard-card-section">
              <p className="wizard-section-label">Wage Growth</p>
              <p>{job.wageGrowth}</p>
            </div>
            <p className="wizard-card-description">{job.outlook}</p>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep4Job
