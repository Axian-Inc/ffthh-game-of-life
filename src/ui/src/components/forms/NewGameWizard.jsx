import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import {
  CITY_OPTIONS,
  DEFAULT_CITY_ID,
  DEFAULT_EDUCATION_TRACK_ID,
  DEFAULT_JOB_ID,
  EDUCATION_TRACK_OPTIONS,
  JOB_OPTIONS,
} from '../../data/wizardVisualCatalog'
import { getGameNameError } from '../../utils/gameValidation'
import { PLAYER_AVATAR_OPTIONS } from '../../data/playerAvatars'
import NewGameWizardStep1GameName from './NewGameWizardStep1GameName'
import NewGameWizardStep1Player from './NewGameWizardStep1Player'
import NewGameWizardStep2City from './NewGameWizardStep2City'
import NewGameWizardStep3Track from './NewGameWizardStep3Track'
import NewGameWizardStep4Job from './NewGameWizardStep4Job'
import NewGameWizardStep6Summary from './NewGameWizardStep6Summary'
import './new-game-wizard.css'

const MIN_START_PLAYERS = 2

const STEP_META = {
  1: { title: 'New Game Setup', subtitle: 'Step 1 of 6' },
  2: { title: 'New Player Setup', subtitle: 'Step 2 of 6' },
  3: { title: 'New Player Setup - Pick City', subtitle: 'Step 3 of 6' },
  4: { title: 'New Player Setup - Education Track', subtitle: 'Step 4 of 6' },
  5: { title: 'New Player Setup - Pick a Career', subtitle: 'Step 5 of 6' },
  6: { title: 'New Game - Summary', subtitle: 'Step 6 of 6' },
}

const createDraftProfile = (name = '', avatar = PLAYER_AVATAR_OPTIONS[0].key) => ({
  name,
  avatar,
  cityId: DEFAULT_CITY_ID,
  educationTrackId: DEFAULT_EDUCATION_TRACK_ID,
  jobId: DEFAULT_JOB_ID,
})

const NewGameWizard = ({
  onCancel,
  onSubmit,
  gameName,
  onGameNameChange,
  onGameNameBlur,
  gameNameTouched,
  isGameNameValid,
  isGameNameTooLong,
  maxGameNameLength,
  maxPlayerNameLength,
  draftPlayer,
  draftErrors,
  onAddPlayer,
  onDraftNameChange,
  onDraftBlur,
  isCreating,
}) => {
  const [step, setStep] = useState(1)
  const [configuredPlayers, setConfiguredPlayers] = useState([])
  const [playerNameError, setPlayerNameError] = useState('')
  const [draftProfile, setDraftProfile] = useState(createDraftProfile(draftPlayer.name, draftPlayer.avatar))
  const [title, setTitle] = useState(gameName)

  const cityById = useMemo(
    () => Object.fromEntries(CITY_OPTIONS.map((option) => [option.id, option])),
    [],
  )
  const trackById = useMemo(
    () => Object.fromEntries(EDUCATION_TRACK_OPTIONS.map((option) => [option.id, option])),
    [],
  )
  const jobById = useMemo(
    () => Object.fromEntries(JOB_OPTIONS.map((option) => [option.id, option])),
    [],
  )

  useEffect(() => {
    setTitle(gameName)
  }, [gameName])

  const trimmedGameName = title.trim()
  const isTitleTooLong = trimmedGameName.length > maxGameNameLength
  const isTitleValid = trimmedGameName.length > 0 && !isTitleTooLong
  const gameNameError = gameNameTouched
    ? getGameNameError({
        isValid: isGameNameValid || isTitleValid,
        isTooLong: isGameNameTooLong || isTitleTooLong,
        maxLength: maxGameNameLength,
      })
    : ''
  const isGameNameStepValid = isTitleValid

  const handleDraftNameChange = (event) => {
    onDraftNameChange(event)
    setDraftProfile((current) => ({ ...current, name: event.target.value }))
    setPlayerNameError('')
  }

  const handleGameNameChange = (event) => {
    setTitle(event.target.value)
    onGameNameChange(event)
  }

  const handleAvatarSelect = (avatarKey) => {
    setDraftProfile((current) => ({ ...current, avatar: avatarKey }))
  }

  const handleCommitPlayer = () => {
    const trimmedName = draftProfile.name.trim()
    const duplicateName = configuredPlayers.some(
      (player) => player.name.toLowerCase() === trimmedName.toLowerCase(),
    )
    if (!trimmedName) {
      setPlayerNameError('Nickname is required.')
      return false
    }
    if (trimmedName.length > maxPlayerNameLength) {
      setPlayerNameError(`Name must be ${maxPlayerNameLength} characters or fewer.`)
      return false
    }
    if (duplicateName) {
      setPlayerNameError('Names must be unique.')
      return false
    }

    const selectedJob = jobById[draftProfile.jobId]
    const nextPlayer = {
      id: `player-${configuredPlayers.length + 1}`,
      name: trimmedName,
      avatar: draftProfile.avatar,
      cityId: draftProfile.cityId,
      educationTrackId: draftProfile.educationTrackId,
      jobId: draftProfile.jobId,
      careerTrack: selectedJob.careerTrack,
    }

    setConfiguredPlayers((current) => [...current, nextPlayer])
    onAddPlayer?.()
    setDraftProfile(createDraftProfile('', draftProfile.avatar))
    setPlayerNameError('')
    setStep(6)
    return true
  }

  const handleStartGame = () => {
    const payload = {
      name: trimmedGameName,
      players: configuredPlayers.map((player) => ({ ...player })),
    }
    onSubmit(payload)
  }

  const canStartGame = isGameNameStepValid && configuredPlayers.length >= MIN_START_PLAYERS && !isCreating

  const meta = STEP_META[step]

  return (
    <div className="new-game-wizard" data-step={step}>
      <div className="new-game-wizard-header">
        <div>
          <h2 className="new-game-wizard-title">{meta.title}</h2>
          <p className="new-game-wizard-subtitle">{meta.subtitle}</p>
        </div>
        <button className="modal-close" type="button" onClick={onCancel} aria-label="Close modal">
          <X aria-hidden="true" />
        </button>
      </div>

      {step === 1 ? (
        <NewGameWizardStep1GameName
          gameName={title}
          maxGameNameLength={maxGameNameLength}
          gameNameError={gameNameError}
          onGameNameChange={handleGameNameChange}
          onGameNameBlur={onGameNameBlur}
          onNext={() => setStep(2)}
          isNextDisabled={!isGameNameStepValid || isCreating}
        />
      ) : null}

      {step === 2 ? (
        <NewGameWizardStep1Player
          playerName={draftProfile.name}
          maxPlayerNameLength={maxPlayerNameLength}
          playerNameError={playerNameError || draftErrors.name}
          selectedAvatar={draftProfile.avatar}
          avatarOptions={PLAYER_AVATAR_OPTIONS.slice(0, 25)}
          onPlayerNameChange={handleDraftNameChange}
          onPlayerNameBlur={() => onDraftBlur('name')}
          onAvatarSelect={handleAvatarSelect}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      ) : null}

      {step === 3 ? (
        <NewGameWizardStep2City
          cityOptions={CITY_OPTIONS}
          selectedCityId={draftProfile.cityId}
          onSelectCity={(cityId) => setDraftProfile((current) => ({ ...current, cityId }))}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      ) : null}

      {step === 4 ? (
        <NewGameWizardStep3Track
          trackOptions={EDUCATION_TRACK_OPTIONS}
          selectedTrackId={draftProfile.educationTrackId}
          onSelectTrack={(educationTrackId) =>
            setDraftProfile((current) => ({
              ...current,
              educationTrackId,
            }))
          }
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      ) : null}

      {step === 5 ? (
        <NewGameWizardStep4Job
          jobOptions={JOB_OPTIONS}
          selectedJobId={draftProfile.jobId}
          onSelectJob={(jobId) => setDraftProfile((current) => ({ ...current, jobId }))}
          onBack={() => setStep(4)}
          onNext={handleCommitPlayer}
        />
      ) : null}

      {step === 6 ? (
        <NewGameWizardStep6Summary
          gameName={title}
          maxGameNameLength={maxGameNameLength}
          gameNameError={gameNameError}
          players={configuredPlayers}
          citiesById={cityById}
          tracksById={trackById}
          jobsById={jobById}
          onGameNameChange={handleGameNameChange}
          onGameNameBlur={onGameNameBlur}
          onBack={() => setStep(5)}
          onNewPlayer={() => {
            setDraftProfile(createDraftProfile('', draftProfile.avatar))
            setStep(2)
          }}
          onStartGame={handleStartGame}
          canStartGame={canStartGame}
        />
      ) : null}
    </div>
  )
}

export default NewGameWizard
