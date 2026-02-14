import { Gamepad2, X } from 'lucide-react'
import ModalBackdrop from './ModalBackdrop'
import PrimaryButton from '../ui/PrimaryButton'
import TextField from '../ui/TextField'
import SelectField from '../ui/SelectField'
import PlayersSection from '../forms/PlayersSection'
import { getGameNameError } from '../../utils/gameValidation'

const CreateGameModal = ({
  isOpen,
  onBackdropClick,
  onCancel,
  onSubmit,
  gameName,
  onGameNameChange,
  onGameNameBlur,
  gameNameTouched,
  isGameNameValid,
  isGameNameTooLong,
  maxGameNameLength,
  gameType,
  scoringMode,
  onGameTypeChange,
  onScoringModeChange,
  players,
  minPlayers,
  maxPlayerNameLength,
  draftPlayer,
  draftTouched,
  draftErrors,
  arePlayersValid,
  onAddPlayer,
  onRemovePlayer,
  onDraftNameChange,
  onDraftBlur,
  onDraftShuffle,
  createError,
  isCreating,
}) => {
  if (!isOpen) {
    return null
  }

  const gameNameError = getGameNameError({
    isValid: isGameNameValid,
    isTooLong: isGameNameTooLong,
    maxLength: maxGameNameLength,
  })
  const playerCount = players.length
  const canStartGame = isGameNameValid && arePlayersValid
  const isGameNameMissing = !gameName.trim()
  const startLabel = `Start Game with ${playerCount} Player${playerCount === 1 ? '' : 's'}`

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <div className="modal" data-test-id="create-game-modal">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon" aria-hidden="true">
              <Gamepad2 aria-hidden="true" />
            </div>
            <div>
              <h2 className="modal-title">New Game</h2>
              <p className="modal-subtitle">Let's get the fun started!</p>
            </div>
          </div>
          <button className="modal-close" type="button" onClick={onCancel} aria-label="Close modal">
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">
          <form className="create-form" onSubmit={(event) => event.preventDefault()}>
            <TextField
              id="game-name"
              label="Game Name"
              type="text"
              placeholder="Family Game Night"
              maxLength={maxGameNameLength}
              value={gameName}
              onChange={onGameNameChange}
              onBlur={onGameNameBlur}
              aria-invalid={!isGameNameValid && gameNameTouched}
              disabled={isCreating}
              error={gameNameTouched ? gameNameError : ''}
              data-test-id="game-name-input"
            />
            <div className="field-row">
              <SelectField
                id="game-type"
                label="Game type"
                value={gameType}
                onChange={onGameTypeChange}
                disabled={isCreating}
                data-test-id="career-path-select"
              >
                <option value="classic">Classic</option>
                <option value="highlife">HighLife</option>
                <option value="seeds">Seeds</option>
              </SelectField>
              <SelectField
                id="scoring-mode"
                label="Scoring mode"
                value={scoringMode}
                onChange={onScoringModeChange}
                disabled={isCreating}
                data-test-id="scoring-mode-select"
              >
                <option value="standard">Standard</option>
                <option value="speed">Speed</option>
                <option value="endless">Endless</option>
              </SelectField>
            </div>
            <PlayersSection
              players={players}
              minPlayers={minPlayers}
              maxPlayerNameLength={maxPlayerNameLength}
              draftPlayer={draftPlayer}
              draftTouched={draftTouched}
              draftErrors={draftErrors}
              arePlayersValid={arePlayersValid}
              onAddPlayer={onAddPlayer}
              onRemovePlayer={onRemovePlayer}
              onDraftNameChange={onDraftNameChange}
              onDraftBlur={onDraftBlur}
              onDraftShuffle={onDraftShuffle}
              isCreating={isCreating}
            />
          </form>
          {createError ? (
            <p className="field-error" role="alert">
              {createError}
            </p>
          ) : null}
        </div>
        <div className="modal-footer create-footer">
          <PrimaryButton onClick={onSubmit} disabled={!canStartGame || isCreating} data-test-id="start-game-button">
            {isCreating ? 'Creating...' : startLabel}
          </PrimaryButton>
          {playerCount === 0 ? (
            <p className="footer-hint">Add at least one player to start.</p>
          ) : null}
          {isGameNameMissing ? (
            <p className="footer-hint">Enter a game name to continue.</p>
          ) : null}
        </div>
      </div>
    </ModalBackdrop>
  )
}

export default CreateGameModal
