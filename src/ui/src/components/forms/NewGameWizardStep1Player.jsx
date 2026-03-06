import { wizardPersonas } from '../../data/wizardVisualCatalog'

const NewGameWizardStep1Player = ({
  playerName,
  selectedPersonaId,
  onNameChange,
  onNameBlur,
  onPersonaSelect,
  showNameError,
}) => (
  <div className="wizard-step wizard-step-player" data-step="1">
    <label className="wizard-field" htmlFor="wizard-player-name">
      <span className="wizard-field-label">Player Name:</span>
      <input
        id="wizard-player-name"
        name="playerName"
        type="text"
        placeholder="Enter a distinct name..."
        value={playerName}
        onChange={onNameChange}
        onBlur={onNameBlur}
        autoComplete="off"
        aria-invalid={showNameError}
      />
    </label>
    <div className="wizard-field">
      <div className="wizard-field-label">Choose Your Digital Persona:</div>
      <div className="wizard-persona-grid" role="list" aria-label="Choose your digital persona">
        {wizardPersonas.map((persona) => (
          <button
            key={persona.id}
            type="button"
            className={`wizard-persona-tile ${selectedPersonaId === persona.id ? 'is-selected' : ''}`}
            aria-label={persona.label}
            aria-pressed={selectedPersonaId === persona.id}
            onClick={() => onPersonaSelect(persona.id)}
          >
            <img alt="" aria-hidden="true" src={persona.asset} />
          </button>
        ))}
      </div>
    </div>
    {showNameError ? <p className="wizard-error">Enter a player name to continue.</p> : null}
  </div>
)

export default NewGameWizardStep1Player
