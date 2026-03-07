import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const NewGameWizardStep4Job = ({ options, selectedJobId, activePlayerName, onSelect, onBack, onNext }) => (
  <div className="wizard-step wizard-step-choice wizard-step-job">
    <p className="wizard-player-context">Configuring: {activePlayerName || 'Player'}</p>
    <div className="wizard-card-rail" role="radiogroup" aria-label="Career options">
      {options.map((job, index) => {
        const selected = job.id === selectedJobId
        return (
          <article
            key={job.id}
            className={`wizard-choice-card wizard-job-card rail-${index + 1} ${selected ? 'is-selected' : ''}`}
            onClick={() => onSelect(job.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(job.id)
              }
            }}
            role="radio"
            tabIndex={0}
            aria-checked={selected}
            aria-label={job.title}
          >
            <img src={job.art} alt="" aria-hidden="true" className="wizard-choice-art" />
            <div className="wizard-job-title-block">
              <h3>{job.title}</h3>
              <p>{job.subtitle}</p>
            </div>
            <div className="wizard-job-income-block">
              <h4>Income</h4>
              <p>{job.income}</p>
            </div>
          </article>
        )
      })}
    </div>
    <div className="wizard-footer-row wizard-footer-row-inline">
      <SecondaryButton onClick={onBack}>Back</SecondaryButton>
      <PrimaryButton onClick={onNext} disabled={!selectedJobId}>
        Next
      </PrimaryButton>
    </div>
  </div>
)

export default NewGameWizardStep4Job
