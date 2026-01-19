import ModalBackdrop from './ModalBackdrop'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
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
  playerTouched,
  getPlayerError,
  hasPlayerValidation,
  arePlayersValid,
  onAddPlayer,
  onRemovePlayer,
  onPlayerNameChange,
  onPlayerBlur,
  onRandomizeAvatar,
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

  return (
    <ModalBackdrop onBackdropClick={onBackdropClick}>
      <div className="modal-card">
        <div className="modal-header">
          <p className="eyebrow">Create Game</p>
          <h2>Build a new universe</h2>
        </div>
        <form className="create-form" onSubmit={(event) => event.preventDefault()}>
          <TextField
            id="game-name"
            label="Game name"
            type="text"
            placeholder="Family Game Night"
            maxLength={maxGameNameLength}
            value={gameName}
            onChange={onGameNameChange}
            onBlur={onGameNameBlur}
            aria-invalid={!isGameNameValid && gameNameTouched}
            disabled={isCreating}
            error={gameNameTouched ? gameNameError : ''}
          />
          <div className="field-row">
            <SelectField
              id="game-type"
              label="Game type"
              value={gameType}
              onChange={onGameTypeChange}
              disabled={isCreating}
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
            playerTouched={playerTouched}
            getPlayerError={getPlayerError}
            hasPlayerValidation={hasPlayerValidation}
            arePlayersValid={arePlayersValid}
            onAddPlayer={onAddPlayer}
            onRemovePlayer={onRemovePlayer}
            onPlayerNameChange={onPlayerNameChange}
            onPlayerBlur={onPlayerBlur}
            onRandomizeAvatar={onRandomizeAvatar}
            isCreating={isCreating}
          />
        </form>
        {createError ? (
          <p className="field-error" role="alert">
            {createError}
          </p>
        ) : null}
        <div className="modal-actions">
          <SecondaryButton onClick={onCancel} disabled={isCreating}>
            Back to home
          </SecondaryButton>
          <PrimaryButton
            onClick={onSubmit}
            disabled={!isGameNameValid || !arePlayersValid || isCreating}
          >
            {isCreating ? 'Creating...' : 'Start setup'}
          </PrimaryButton>
        </div>
      </div>
    </ModalBackdrop>
  )
}

export default CreateGameModal
