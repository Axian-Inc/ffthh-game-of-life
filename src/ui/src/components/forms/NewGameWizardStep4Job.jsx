import { getWizardJobsForTrack, wizardSectionStyles } from '../../data/wizardVisualCatalog'

const NewGameWizardStep4Job = ({ selectedTrackId, selectedJobId, onSelect }) => {
  const jobs = getWizardJobsForTrack(selectedTrackId)

  return (
    <div className="wizard-step wizard-step-rail" data-step="4">
      <div className="wizard-card-rail wizard-card-rail-overhang" aria-label="Choose your career">
        {jobs.map((job, index) => {
          const isSelected = job.id === selectedJobId
          return (
            <button
              key={job.id}
              type="button"
              className={`wizard-choice-card wizard-choice-card-job wizard-rail-position-${index} ${
                isSelected ? 'is-selected' : ''
              }`}
              aria-pressed={isSelected}
              onClick={() => onSelect(job.id)}
            >
              <img alt="" aria-hidden="true" src={job.asset} className="wizard-job-hero" />
              <h3>{job.title}</h3>
              {job.stats.map((stat) => {
                const sectionStyle = wizardSectionStyles[stat.section]
                return (
                  <div key={`${job.id}-${stat.section}`} className="wizard-choice-section wizard-choice-section-job">
                    <div className={`wizard-choice-bar ${sectionStyle.className}`}>{stat.section}</div>
                    <div className="wizard-job-stat">
                      <span className={`wizard-stat-pill ${sectionStyle.iconClassName}`}>
                        {stat.section === 'Income' ? '$' : stat.section === 'Stability' ? 'S' : '+'}
                      </span>
                      <span>{stat.text}</span>
                    </div>
                  </div>
                )
              })}
              <p className="wizard-choice-copy wizard-choice-copy-job">{job.outlook}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default NewGameWizardStep4Job
