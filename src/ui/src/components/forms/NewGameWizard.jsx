import { useMemo, useState } from 'react'
import { DEFAULT_PLAYER_AVATAR_KEY, PLAYER_AVATAR_OPTIONS } from '../../data/playerAvatars'
import { WIZARD_JOB_OPTIONS, WIZARD_STEP_META } from '../../data/wizardVisualCatalog'
import NewGameWizardStep1GameName from './NewGameWizardStep1GameName'
import NewGameWizardStep1Player from './NewGameWizardStep1Player'
import NewGameWizardStep2City from './NewGameWizardStep2City'
import NewGameWizardStep3Track from './NewGameWizardStep3Track'
import NewGameWizardStep4Job from './NewGameWizardStep4Job'
import NewGameWizardStep6Summary from './NewGameWizardStep6Summary'
import './new-game-wizard.css'

const MAX_GAME_NAME_LENGTH = 60
const MAX_PLAYER_NAME_LENGTH = 24
const MIN_PLAYERS_TO_START = 2

const createPlayerDraft = (avatar = DEFAULT_PLAYER_AVATAR_KEY) => ({
  name: '',
  avatar,
  cityId: '',
  educationTrackId: '',
  jobId: '',
})

const buildPlayerId = (index) => `player-${index + 1}`

const getNameError = (value, existingPlayers) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'Player name is required.'
  }
  if (trimmed.length > MAX_PLAYER_NAME_LENGTH) {
    return `Name must be ${MAX_PLAYER_NAME_LENGTH} characters or fewer.`
  }

  const normalized = trimmed.toLowerCase()
  const isDuplicate = existingPlayers.some((player) => player.name.trim().toLowerCase() === normalized)
  if (isDuplicate) {
    return 'Player names must be unique.'
  }

  return ''
}

const NewGameWizard = ({ initialGameName = '', onCancel, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [gameName, setGameName] = useState(initialGameName)
  const [players, setPlayers] = useState([])
  const [draftPlayer, setDraftPlayer] = useState(createPlayerDraft())

  const trimmedGameName = gameName.trim()
  const isGameNameValid = trimmedGameName.length > 0
  const playerNameError = getNameError(draftPlayer.name, players)
  const canAdvancePlayerStep = {
    2: !playerNameError,
    3: Boolean(draftPlayer.cityId),
    4: Boolean(draftPlayer.educationTrackId),
    5: Boolean(draftPlayer.jobId),
  }

  const canStartGame = isGameNameValid && players.length >= MIN_PLAYERS_TO_START

  const selectedJob = useMemo(
    () => WIZARD_JOB_OPTIONS.find((job) => job.id === draftPlayer.jobId) || null,
    [draftPlayer.jobId],
  )

  const resetDraft = (playerCount = players.length) => {
    const nextAvatar =
      PLAYER_AVATAR_OPTIONS[playerCount % PLAYER_AVATAR_OPTIONS.length]?.key || DEFAULT_PLAYER_AVATAR_KEY
    setDraftPlayer(createPlayerDraft(nextAvatar))
  }

  const handleBack = () => {
    if (currentStep === 1) {
      onCancel()
      return
    }

    if (currentStep === 6) {
      if (players.length > 0) {
        const cloned = [...players]
        const lastPlayer = cloned.pop()
        setPlayers(cloned)
        setDraftPlayer({
          name: lastPlayer.name,
          avatar: lastPlayer.avatar,
          cityId: lastPlayer.cityId,
          educationTrackId: lastPlayer.educationTrackId,
          jobId: lastPlayer.jobId,
        })
        setCurrentStep(5)
        return
      }
      setCurrentStep(1)
      return
    }

    setCurrentStep((step) => step - 1)
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!isGameNameValid) {
        return
      }
      setCurrentStep(2)
      return
    }

    if (!canAdvancePlayerStep[currentStep]) {
      return
    }

    if (currentStep === 5) {
      const playerPayload = {
        id: buildPlayerId(players.length),
        name: draftPlayer.name.trim(),
        avatar: draftPlayer.avatar,
        cityId: draftPlayer.cityId,
        educationTrackId: draftPlayer.educationTrackId,
        jobId: draftPlayer.jobId,
        careerTrack: selectedJob?.careerTrack || draftPlayer.educationTrackId,
      }
      setPlayers((current) => [...current, playerPayload])
      resetDraft(players.length + 1)
      setCurrentStep(6)
      return
    }

    setCurrentStep((step) => step + 1)
  }

  const handleAddNewPlayer = () => {
    resetDraft()
    setCurrentStep(2)
  }

  const handleSubmit = () => {
    if (!canStartGame) {
      return
    }
    onSubmit({
      name: trimmedGameName,
      players: players.map((player) => ({ ...player })),
    })
  }

  const stepMeta = WIZARD_STEP_META[currentStep]

  return (
    <section className="wizard-modal" aria-label="New game wizard">
      <header className="wizard-header">
        <h2 className="wizard-title">{stepMeta.title}</h2>
        <p className="wizard-subtitle">{stepMeta.subtitle}</p>
      </header>

      <div className="wizard-body">
        {currentStep === 1 ? (
          <NewGameWizardStep1GameName
            gameName={gameName}
            onGameNameChange={setGameName}
            maxGameNameLength={MAX_GAME_NAME_LENGTH}
            onNext={handleNext}
            isNextDisabled={!isGameNameValid}
          />
        ) : null}

        {currentStep === 2 ? (
          <NewGameWizardStep1Player
            playerName={draftPlayer.name}
            onPlayerNameChange={(value) => setDraftPlayer((current) => ({ ...current, name: value }))}
            selectedAvatar={draftPlayer.avatar}
            onAvatarChange={(avatar) => setDraftPlayer((current) => ({ ...current, avatar }))}
            avatarOptions={PLAYER_AVATAR_OPTIONS}
            maxPlayerNameLength={MAX_PLAYER_NAME_LENGTH}
            playerNameError={playerNameError}
          />
        ) : null}

        {currentStep === 3 ? (
          <NewGameWizardStep2City
            selectedCityId={draftPlayer.cityId}
            onSelectCity={(cityId) => setDraftPlayer((current) => ({ ...current, cityId }))}
          />
        ) : null}

        {currentStep === 4 ? (
          <NewGameWizardStep3Track
            selectedTrackId={draftPlayer.educationTrackId}
            onSelectTrack={(educationTrackId) => setDraftPlayer((current) => ({ ...current, educationTrackId }))}
          />
        ) : null}

        {currentStep === 5 ? (
          <NewGameWizardStep4Job
            selectedJobId={draftPlayer.jobId}
            onSelectJob={(jobId) => setDraftPlayer((current) => ({ ...current, jobId }))}
          />
        ) : null}

        {currentStep === 6 ? (
          <NewGameWizardStep6Summary
            gameName={gameName}
            onGameNameChange={setGameName}
            maxGameNameLength={MAX_GAME_NAME_LENGTH}
            players={players}
          />
        ) : null}
      </div>

      {currentStep >= 2 && currentStep <= 5 ? (
        <footer className="wizard-footer wizard-footer-row">
          <button type="button" className="secondary-action wizard-footer-button" onClick={handleBack}>
            Back
          </button>
          <button
            type="button"
            className="primary-action wizard-footer-button"
            onClick={handleNext}
            disabled={!canAdvancePlayerStep[currentStep]}
          >
            Next
          </button>
        </footer>
      ) : null}

      {currentStep === 6 ? (
        <footer className="wizard-footer wizard-footer-center">
          <button type="button" className="secondary-action wizard-footer-button" onClick={handleAddNewPlayer}>
            + New Player
          </button>
          <button
            type="button"
            className="primary-action wizard-footer-button"
            onClick={handleSubmit}
            disabled={!canStartGame}
          >
            Start Game
          </button>
        </footer>
      ) : null}
    </section>
  )
}

export default NewGameWizard
