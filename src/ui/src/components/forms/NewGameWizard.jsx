import { useMemo, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { PLAYER_AVATAR_OPTIONS } from '../../data/playerAvatars'
import {
  WIZARD_CAREER_BY_ID,
  WIZARD_PROGRESS_SEGMENTS,
  WIZARD_TRACK_BY_ID,
  getCareerOptionsForTrack,
} from '../../data/wizardVisualCatalog'
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

const createPlayerDraft = () => ({
  name: '',
  avatar: '',
  cityId: '',
  educationTrackId: '',
  jobId: '',
})

const buildPlayerId = (index) => `player-${index + 1}`

const getNameError = (value, existingPlayers) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'Nickname is required.'
  }
  if (trimmed.length > MAX_PLAYER_NAME_LENGTH) {
    return `Nickname must be ${MAX_PLAYER_NAME_LENGTH} characters or fewer.`
  }

  const normalized = trimmed.toLowerCase()
  const isDuplicate = existingPlayers.some((player) => player.name.trim().toLowerCase() === normalized)
  if (isDuplicate) {
    return 'Nicknames must be unique.'
  }

  return ''
}

const getStepTitle = (currentStep, playerNumber) => {
  if (currentStep === 1) {
    return 'Name Your Game'
  }
  if (currentStep === 2) {
    return `Player ${playerNumber}`
  }
  if (currentStep === 3) {
    return 'Choose a City'
  }
  if (currentStep === 4) {
    return 'Career Track'
  }
  if (currentStep === 5) {
    return 'Pick a Career'
  }
  return 'Ready to Play'
}

const NewGameWizard = ({ onCancel, onSubmit, submitError = '', isSubmitting = false }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [gameName, setGameName] = useState('')
  const [players, setPlayers] = useState([])
  const [draftPlayer, setDraftPlayer] = useState(createPlayerDraft())

  const trimmedGameName = gameName.trim()
  const isGameNameValid = trimmedGameName.length > 0
  const playerNameError = getNameError(draftPlayer.name, players)
  const isAvatarSelected = Boolean(draftPlayer.avatar)
  const careerOptions = useMemo(
    () => getCareerOptionsForTrack(draftPlayer.educationTrackId),
    [draftPlayer.educationTrackId],
  )

  const canAdvance = {
    1: isGameNameValid,
    2: !playerNameError && isAvatarSelected,
    3: Boolean(draftPlayer.cityId),
    4: Boolean(draftPlayer.educationTrackId),
    5: Boolean(draftPlayer.jobId),
  }

  const canStartGame = isGameNameValid && players.length >= MIN_PLAYERS_TO_START
  const playerNumber = players.length + 1
  const showBackButton = currentStep >= 2 && currentStep <= 5
  const showProgress = currentStep <= WIZARD_PROGRESS_SEGMENTS

  const handleBack = () => {
    if (!showBackButton) {
      return
    }
    setCurrentStep((step) => Math.max(1, step - 1))
  }

  const handleNext = () => {
    if (!canAdvance[currentStep]) {
      return
    }

    if (currentStep === 5) {
      const selectedTrack = WIZARD_TRACK_BY_ID[draftPlayer.educationTrackId] || null
      const selectedCareer = WIZARD_CAREER_BY_ID[draftPlayer.jobId] || null
      const nextPlayer = {
        id: buildPlayerId(players.length),
        name: draftPlayer.name.trim(),
        avatar: draftPlayer.avatar,
        cityId: draftPlayer.cityId,
        educationTrackId: draftPlayer.educationTrackId,
        jobId: draftPlayer.jobId,
        careerTrack: selectedTrack?.name || selectedCareer?.title || null,
      }

      setPlayers((current) => [...current, nextPlayer])
      setDraftPlayer(createPlayerDraft())
      setCurrentStep(6)
      return
    }

    setCurrentStep((step) => step + 1)
  }

  const handleAddPlayer = () => {
    setDraftPlayer(createPlayerDraft())
    setCurrentStep(2)
  }

  const handleSubmit = async () => {
    if (!canStartGame || isSubmitting) {
      return
    }

    await onSubmit({
      name: trimmedGameName,
      players: players.map((player) => ({ ...player })),
    })
  }

  return (
    <section className={`wizard-modal${currentStep === 6 ? ' is-summary' : ''}`} aria-label="New game wizard">
      <header className="wizard-header">
        <div className="wizard-header-row">
          {showBackButton ? (
            <button type="button" className="wizard-icon-button" onClick={handleBack} aria-label="Back">
              <ArrowLeft aria-hidden="true" />
            </button>
          ) : (
            <span className="wizard-icon-spacer" aria-hidden="true" />
          )}
          <h2 className="wizard-title">{getStepTitle(currentStep, playerNumber)}</h2>
          <button type="button" className="wizard-icon-button" onClick={onCancel} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </div>
        {showProgress ? (
          <div className="wizard-progress" aria-label={`Progress step ${currentStep} of ${WIZARD_PROGRESS_SEGMENTS}`}>
            {Array.from({ length: WIZARD_PROGRESS_SEGMENTS }, (_, index) => (
              <span
                key={`progress-${index + 1}`}
                className={`wizard-progress-segment${index + 1 <= currentStep ? ' is-active' : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>
        ) : null}
      </header>

      <div className="wizard-body">
        {currentStep === 1 ? (
          <NewGameWizardStep1GameName
            gameName={gameName}
            onGameNameChange={setGameName}
            maxGameNameLength={MAX_GAME_NAME_LENGTH}
            onNext={handleNext}
            isNextDisabled={!canAdvance[1]}
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
            onNext={handleNext}
            isNextDisabled={!canAdvance[2]}
          />
        ) : null}

        {currentStep === 3 ? (
          <NewGameWizardStep2City
            selectedCityId={draftPlayer.cityId}
            onSelectCity={(cityId) => setDraftPlayer((current) => ({ ...current, cityId }))}
            onNext={handleNext}
            isNextDisabled={!canAdvance[3]}
          />
        ) : null}

        {currentStep === 4 ? (
          <NewGameWizardStep3Track
            selectedTrackId={draftPlayer.educationTrackId}
            onSelectTrack={(educationTrackId) =>
              setDraftPlayer((current) => ({
                ...current,
                educationTrackId,
                jobId: current.educationTrackId === educationTrackId ? current.jobId : '',
              }))
            }
            onNext={handleNext}
            isNextDisabled={!canAdvance[4]}
          />
        ) : null}

        {currentStep === 5 ? (
          <NewGameWizardStep4Job
            selectedJobId={draftPlayer.jobId}
            onSelectJob={(jobId) => setDraftPlayer((current) => ({ ...current, jobId }))}
            careerOptions={careerOptions}
            onNext={handleNext}
            isNextDisabled={!canAdvance[5]}
          />
        ) : null}

        {currentStep === 6 ? (
          <NewGameWizardStep6Summary
            gameName={trimmedGameName}
            players={players}
            onAddPlayer={handleAddPlayer}
            onStart={handleSubmit}
            isStartDisabled={!canStartGame || isSubmitting}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        ) : null}
      </div>
    </section>
  )
}

export default NewGameWizard
