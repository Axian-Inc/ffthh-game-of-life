import { ArrowRight } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'

const NewGameWizardStep4Job = ({ selectedJobId, onSelectJob, careerOptions, onNext, isNextDisabled }) => (
  <div className="wizard-step" data-step="5">
    <div className="wizard-choice-list wizard-career-list">
      {careerOptions.map((job) => {
        const isSelected = job.id === selectedJobId
        return (
          <button
            key={job.id}
            type="button"
            className={`wizard-choice-card wizard-career-card${isSelected ? ' is-selected' : ''}`}
            onClick={() => onSelectJob(job.id)}
            aria-pressed={isSelected}
          >
            <div className="wizard-choice-title-row">
              <span className="wizard-choice-icon" aria-hidden="true">
                {job.icon}
              </span>
              <h3>{job.title}</h3>
            </div>
            <div className="wizard-career-metrics">
              <span>💰 {job.income}</span>
              <span>🏦 {job.debt}</span>
              <span>🎯 {job.activities}</span>
              <span>❤️ {job.shorthand}</span>
            </div>
          </button>
        )
      })}
    </div>
    <PrimaryButton className="wizard-action-button" onClick={onNext} disabled={isNextDisabled}>
      Next <ArrowRight aria-hidden="true" />
    </PrimaryButton>
  </div>
)

export default NewGameWizardStep4Job
