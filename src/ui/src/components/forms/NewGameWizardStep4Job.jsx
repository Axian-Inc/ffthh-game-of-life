import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import { WIZARD_JOB_OPTIONS } from '../../data/wizardVisualCatalog'

const NewGameWizardStep4Job = ({ selectedJobId, onSelectJob, onBack, onNext }) => (
  <div className="wizard-step" data-step="5">
    <header className="wizard-heading">
      <h2 className="wizard-title">New Player Setup - Pick a Career</h2>
      <p className="wizard-subtitle">Step 5 of 6</p>
    </header>
    <div className="wizard-rail wizard-rail-jobs">
      {WIZARD_JOB_OPTIONS.map((job) => (
        <button
          key={job.id}
          type="button"
          className={`wizard-card wizard-job-card ${selectedJobId === job.id ? 'is-selected' : ''}`}
          onClick={() => onSelectJob(job.id)}
        >
          <img alt="" aria-hidden="true" className="wizard-job-art" src={job.artSrc} />
          <div className="wizard-job-title-block">
            <h3>{job.label}</h3>
          </div>
          <div className="wizard-stat-block wizard-stat-gold">
            <strong>Income</strong>
            <span>{job.income}</span>
          </div>
          <div className="wizard-stat-block wizard-stat-blue">
            <strong>Stability</strong>
            <span>{job.stability}</span>
          </div>
          <div className="wizard-stat-block wizard-stat-orange">
            <strong>Wage Growth</strong>
            <span>{job.wageGrowth}</span>
          </div>
        </button>
      ))}
    </div>
    <footer className="wizard-footer">
      <SecondaryButton className="wizard-secondary-button" onClick={onBack}>
        Back
      </SecondaryButton>
      <PrimaryButton className="wizard-pill-button" disabled={!selectedJobId} onClick={onNext}>
        Next
      </PrimaryButton>
    </footer>
  </div>
)

export default NewGameWizardStep4Job
