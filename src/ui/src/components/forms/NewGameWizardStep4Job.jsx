import { WIZARD_JOB_ART_BY_ID } from '../../assets/wizard/art'
import { WIZARD_JOB_OPTIONS } from '../../data/wizardVisualCatalog'

const NewGameWizardStep4Job = ({ selectedJobId, onSelectJob }) => (
  <div className="wizard-step" data-step="5">
    <div className="wizard-rail wizard-rail-cards wizard-job-rail">
      {WIZARD_JOB_OPTIONS.map((job) => {
        const isSelected = job.id === selectedJobId
        return (
          <button
            key={job.id}
            type="button"
            className={`wizard-option-card wizard-job-card${isSelected ? ' is-selected' : ''}`}
            onClick={() => onSelectJob(job.id)}
            aria-pressed={isSelected}
          >
            <div className="wizard-job-art-wrap">
              <img src={WIZARD_JOB_ART_BY_ID[job.id]} alt="" aria-hidden="true" />
            </div>
            <div className="wizard-job-title-block">
              <h3>{job.title}</h3>
              <p className="wizard-meta">Track: {job.careerTrack}</p>
            </div>
            <div className="wizard-job-income-block">
              <p>
                <strong>Income</strong>
              </p>
              <p>{job.income}</p>
              <p className="wizard-meta">{job.bonus}</p>
            </div>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep4Job
