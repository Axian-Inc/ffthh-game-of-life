import { WIZARD_CITY_OPTIONS, WIZARD_EDUCATION_TRACKS, WIZARD_JOB_OPTIONS } from '../../data/wizardVisualCatalog'

const cityById = Object.fromEntries(WIZARD_CITY_OPTIONS.map((city) => [city.id, city]))
const trackById = Object.fromEntries(WIZARD_EDUCATION_TRACKS.map((track) => [track.id, track]))
const jobById = Object.fromEntries(WIZARD_JOB_OPTIONS.map((job) => [job.id, job]))

const NewGameWizardStep6Summary = ({ gameName, onGameNameChange, maxGameNameLength, players }) => (
  <div className="wizard-step wizard-step-summary" data-step="6">
    <section className="wizard-summary-sheet" aria-label="New game summary">
      <div className="wizard-summary-header">
        <label htmlFor="wizard-summary-game-name" className="wizard-summary-name-row">
          <span>Game Name:</span>
          <input
            id="wizard-summary-game-name"
            type="text"
            className="wizard-text-input"
            value={gameName}
            maxLength={maxGameNameLength}
            onChange={(event) => onGameNameChange(event.target.value)}
          />
        </label>
      </div>
      <div className="wizard-summary-table" role="table" aria-label="Players summary">
        <div className="wizard-summary-row wizard-summary-row-head" role="row">
          <span role="columnheader">Player</span>
          <span role="columnheader">City</span>
          <span role="columnheader">Education</span>
          <span role="columnheader">Career</span>
        </div>
        {players.map((player) => (
          <div key={player.id} className="wizard-summary-row" role="row">
            <span role="cell">{player.name}</span>
            <span role="cell">{cityById[player.cityId]?.name || player.cityId}</span>
            <span role="cell">{trackById[player.educationTrackId]?.name || player.educationTrackId}</span>
            <span role="cell">{jobById[player.jobId]?.title || player.jobId}</span>
          </div>
        ))}
      </div>
    </section>
  </div>
)

export default NewGameWizardStep6Summary
