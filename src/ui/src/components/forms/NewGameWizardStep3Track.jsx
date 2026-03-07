import { WIZARD_STAT_SECTIONS, WIZARD_TRACKS } from '../../data/wizardVisualCatalog'

const NewGameWizardStep3Track = ({ selectedTrackId, disabled, onSelect }) => (
  <div className="wizard-step wizard-step-rail">
    <div className="wizard-card-rail wizard-track-rail">
      {WIZARD_TRACKS.map((track) => (
        <button
          key={track.id}
          className={`wizard-choice-card ${selectedTrackId === track.id ? 'is-selected' : ''}`}
          disabled={disabled}
          onClick={() => onSelect(track.id)}
          type="button"
        >
          <div className="wizard-choice-title wizard-choice-title-wide">
            <div className="wizard-track-icon-group" aria-hidden="true">
              {track.icons.map((icon) => (
                <img key={icon} alt="" src={icon} />
              ))}
            </div>
            <h3>{track.title}</h3>
          </div>
          {WIZARD_STAT_SECTIONS.track.map((section) => (
            <section className={`wizard-stat-panel panel-${section.color}`} key={section.key}>
              <header>
                <img alt="" aria-hidden="true" src={section.icon} />
                <span>{section.label}</span>
              </header>
              <ul>
                {track[section.key].map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
          <p className="wizard-choice-copy">{track.description}</p>
        </button>
      ))}
    </div>
  </div>
)

export default NewGameWizardStep3Track
