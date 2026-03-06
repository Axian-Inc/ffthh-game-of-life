import { wizardSectionStyles, wizardTracks } from '../../data/wizardVisualCatalog'

const trackCards = Object.values(wizardTracks)

const NewGameWizardStep3Track = ({ selectedTrackId, onSelect }) => (
  <div className="wizard-step wizard-step-rail" data-step="3">
    <div className="wizard-card-rail wizard-card-rail-overhang" aria-label="Choose your education track">
      {trackCards.map((track, index) => {
        const isSelected = track.id === selectedTrackId
        return (
          <button
            key={track.id}
            type="button"
            className={`wizard-choice-card wizard-choice-card-track wizard-rail-position-${index} ${
              isSelected ? 'is-selected' : ''
            }`}
            aria-pressed={isSelected}
            onClick={() => onSelect(track.id)}
          >
            <div className="wizard-choice-header wizard-choice-header-track">
              <img alt="" aria-hidden="true" src={track.asset} className="wizard-choice-icon" />
              <h3>{track.title}</h3>
            </div>
            {['Debt/Investment', 'Long-Term Potential', 'Stability'].map((section) => {
              const sectionStyle = wizardSectionStyles[section]
              const sectionLines = track.bars.filter((line) => line.section === section)
              return (
                <div key={`${track.id}-${section}`} className="wizard-choice-section">
                  <div className={`wizard-choice-bar ${sectionStyle.className}`}>{section}</div>
                  <ul>
                    {sectionLines.map((line) => (
                      <li key={line.text}>
                        <span className={`wizard-stat-pill ${sectionStyle.iconClassName}`}>{line.icon}</span>
                        <span>{line.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            <p className="wizard-choice-copy">{track.description}</p>
          </button>
        )
      })}
    </div>
  </div>
)

export default NewGameWizardStep3Track
