import SecondaryButton from '../ui/SecondaryButton'
import PrimaryButton from '../ui/PrimaryButton'

const NewGameWizardStep4Job = ({ jobs, selectedJobId, onBack, onSelectJob, onNext, canAdvance }) => (
  <div className="wizard-step-panel wizard-step-panel-wide wizard-step-job">
    <div className="wizard-card-rail">
      {jobs.map((job, index) => {
        const isSelected = job.id === selectedJobId
        const positionClass = index === 0 ? 'is-left' : index === 1 ? 'is-center' : 'is-right'
        return (
          <button
            key={job.id}
            type="button"
            aria-label={job.title}
            className={`wizard-option-card wizard-job-card ${positionClass} ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onSelectJob(job.id)}
          >
            <img alt="" className="wizard-option-art wizard-option-art-hero" src={job.artSrc} />
            <div className="wizard-job-title-block">
              <h3>{job.title}</h3>
            </div>
            <section className="wizard-section-block is-gold">
              <h4>Income</h4>
              <ul>
                <li>{job.income}</li>
              </ul>
            </section>
            <section className="wizard-section-block is-blue">
              <h4>Stability</h4>
              <ul>
                <li>{job.stability}</li>
              </ul>
            </section>
            <section className="wizard-section-block is-orange">
              <h4>Wage Growth</h4>
              <ul>
                <li>{job.wageGrowth}</li>
              </ul>
            </section>
          </button>
        )
      })}
    </div>
    <div className="wizard-footer wizard-footer-row wizard-job-footer">
      <SecondaryButton className="wizard-secondary-pill" onClick={onBack}>
        Back
      </SecondaryButton>
      <PrimaryButton className="wizard-pill-button" disabled={!canAdvance} onClick={onNext}>
        Next
      </PrimaryButton>
    </div>
  </div>
)

export default NewGameWizardStep4Job
