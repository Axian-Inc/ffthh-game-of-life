import { WIZARD_JOBS, WIZARD_STAT_SECTIONS } from '../../data/wizardVisualCatalog'

const NewGameWizardStep4Job = ({ selectedJobId, disabled, onSelect }) => (
  <div className="wizard-step wizard-step-rail">
    <div className="wizard-card-rail wizard-job-rail">
      {WIZARD_JOBS.map((job) => (
        <button
          key={job.id}
          className={`wizard-choice-card wizard-job-card ${selectedJobId === job.id ? 'is-selected' : ''}`}
          disabled={disabled}
          onClick={() => onSelect(job.id)}
          type="button"
        >
          <div className="wizard-job-art-wrap">
            <img alt="" aria-hidden="true" className="wizard-job-art" src={job.art} />
          </div>
          <div className="wizard-choice-title wizard-job-title-block">
            <img alt="" aria-hidden="true" className="wizard-choice-icon" src={job.icon} />
            <h3>{job.title}</h3>
          </div>
          {WIZARD_STAT_SECTIONS.job.map((section) => (
            <section className={`wizard-stat-panel panel-${section.color}`} key={section.key}>
              <header>
                <img alt="" aria-hidden="true" src={section.icon} />
                <span>{section.label}</span>
              </header>
              <p>{job[section.key]}</p>
            </section>
          ))}
        </button>
      ))}
    </div>
  </div>
)

export default NewGameWizardStep4Job
