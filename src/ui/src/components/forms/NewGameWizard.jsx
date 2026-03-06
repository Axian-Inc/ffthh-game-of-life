import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import { DEFAULT_PLAYER_AVATAR_KEY, getNextAvailablePlayerAvatarKey, getPlayerAvatarOption } from '../../data/playerAvatars'
import {
  CITY_OPTIONS,
  EDUCATION_TRACK_OPTIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  getCityById,
  getEducationTrackById,
  getJobById,
  getJobsForTrack,
} from '../../data/wizardVisualCatalog'
import NewGameWizardStep1GameName from './NewGameWizardStep1GameName'
import NewGameWizardStep1Player from './NewGameWizardStep1Player'
import NewGameWizardStep2City from './NewGameWizardStep2City'
import NewGameWizardStep3Track from './NewGameWizardStep3Track'
import NewGameWizardStep4Job from './NewGameWizardStep4Job'
import NewGameWizardStep6Summary from './NewGameWizardStep6Summary'
import './new-game-wizard.css'

const STEP_TITLES = {
  1: 'New Game Setup',
  2: 'New Player Setup',
  3: 'New Player Setup - Pick City',
  4: 'New Player Setup - Education Track',
  5: 'New Player Setup - Pick a Career',
  6: 'New Game - Summary',
}

const normalizePlayer = (player, index) => {
  const avatarKey = getPlayerAvatarOption(player.avatar)?.key || DEFAULT_PLAYER_AVATAR_KEY
  return {
    id: String(player.id ?? `player-${index + 1}`),
    name: player.name ?? '',
    avatar: avatarKey,
    cityId: player.cityId ?? '',
    educationTrackId: player.educationTrackId ?? '',
    jobId: player.jobId ?? '',
    careerTrack: player.careerTrack ?? '',
  }
}

const clonePlayers = (players = []) => players.map(normalizePlayer)

const getSuggestedAvatar = (players) => {
  const usedAvatars = players.map((player) => player.avatar)
  if (!usedAvatars.includes(DEFAULT_PLAYER_AVATAR_KEY)) {
    return DEFAULT_PLAYER_AVATAR_KEY
  }
  return getNextAvailablePlayerAvatarKey(DEFAULT_PLAYER_AVATAR_KEY, usedAvatars)
}

const createDraftPlayer = (players) => ({
  id: `player-${players.length + 1}`,
  name: '',
  avatar: getSuggestedAvatar(players),
  cityId: '',
  educationTrackId: '',
  jobId: '',
  careerTrack: '',
})

const NewGameWizard = ({
  initialGameName = '',
  initialPlayers = [],
  createError = '',
  isSubmitting = false,
  onCancel,
  onSubmit,
}) => {
  const [step, setStep] = useState(1)
  const [gameName, setGameName] = useState(initialGameName)
  const [players, setPlayers] = useState(() => clonePlayers(initialPlayers))
  const [draftPlayer, setDraftPlayer] = useState(() => createDraftPlayer(clonePlayers(initialPlayers)))

  useEffect(() => {
    const clonedPlayers = clonePlayers(initialPlayers)
    setStep(1)
    setGameName(initialGameName)
    setPlayers(clonedPlayers)
    setDraftPlayer(createDraftPlayer(clonedPlayers))
  }, [initialGameName, initialPlayers])

  const trimmedGameName = gameName.trim()
  const normalizedDraftName = draftPlayer.name.trim().toLowerCase()
  const isDraftNameDuplicate = players.some((player) => player.name.trim().toLowerCase() === normalizedDraftName)
  const playerNameError = !draftPlayer.name.trim()
    ? 'Player name is required.'
    : isDraftNameDuplicate
      ? 'Names must be unique.'
      : ''

  const selectedTrack = useMemo(
    () => getEducationTrackById(draftPlayer.educationTrackId),
    [draftPlayer.educationTrackId],
  )
  const selectedCity = useMemo(() => getCityById(draftPlayer.cityId), [draftPlayer.cityId])
  const availableJobs = useMemo(
    () => getJobsForTrack(draftPlayer.educationTrackId),
    [draftPlayer.educationTrackId],
  )
  const selectedJob = useMemo(
    () => getJobById(draftPlayer.educationTrackId, draftPlayer.jobId),
    [draftPlayer.educationTrackId, draftPlayer.jobId],
  )

  const canAdvanceFromStep1 = trimmedGameName.length > 0
  const canAdvanceFromStep2 = !playerNameError
  const canAdvanceFromStep3 = Boolean(selectedCity)
  const canAdvanceFromStep4 = Boolean(selectedTrack)
  const canAdvanceFromStep5 = Boolean(selectedJob)
  const canAddPlayer = players.length < MAX_PLAYERS
  const canStartGame = trimmedGameName.length > 0 && players.length >= MIN_PLAYERS && !isSubmitting

  const stepTitle = STEP_TITLES[step]
  const stepSubtitle = `Step ${step} of 6`

  const commitDraftPlayer = () => {
    if (!selectedTrack || !selectedJob) {
      return
    }

    const committedPlayer = {
      ...draftPlayer,
      name: draftPlayer.name.trim(),
      careerTrack: selectedTrack.title,
    }

    setPlayers((current) => [...current, committedPlayer])
    setStep(6)
  }

  const handleAddAnotherPlayer = () => {
    if (!canAddPlayer) {
      return
    }
    setDraftPlayer(createDraftPlayer(players))
    setStep(2)
  }

  const handleSubmit = () => {
    if (!canStartGame) {
      return
    }

    const payload = {
      name: trimmedGameName,
      players: players.map((player) => ({
        id: player.id,
        name: player.name.trim(),
        avatar: player.avatar,
        cityId: player.cityId,
        educationTrackId: player.educationTrackId,
        jobId: player.jobId,
        careerTrack: player.careerTrack,
      })),
    }

    onSubmit?.(payload)
  }

  const renderBody = () => {
    switch (step) {
      case 1:
        return (
          <NewGameWizardStep1GameName
            gameName={gameName}
            onGameNameChange={setGameName}
            onNext={() => setStep(2)}
            canAdvance={canAdvanceFromStep1}
          />
        )
      case 2:
        return (
          <NewGameWizardStep1Player
            player={draftPlayer}
            playerNameError={playerNameError}
            onNameChange={(value) => setDraftPlayer((current) => ({ ...current, name: value }))}
            onAvatarChange={(avatar) => setDraftPlayer((current) => ({ ...current, avatar }))}
            onNext={() => setStep(3)}
            canAdvance={canAdvanceFromStep2}
          />
        )
      case 3:
        return (
          <NewGameWizardStep2City
            cities={CITY_OPTIONS}
            selectedCityId={draftPlayer.cityId}
            onBack={() => setStep(2)}
            onSelectCity={(cityId) => setDraftPlayer((current) => ({ ...current, cityId }))}
            onNext={() => setStep(4)}
            canAdvance={canAdvanceFromStep3}
          />
        )
      case 4:
        return (
          <NewGameWizardStep3Track
            tracks={EDUCATION_TRACK_OPTIONS}
            selectedTrackId={draftPlayer.educationTrackId}
            onBack={() => setStep(3)}
            onSelectTrack={(educationTrackId) =>
              setDraftPlayer((current) => ({ ...current, educationTrackId, jobId: '', careerTrack: '' }))
            }
            onNext={() => setStep(5)}
            canAdvance={canAdvanceFromStep4}
          />
        )
      case 5:
        return (
          <NewGameWizardStep4Job
            jobs={availableJobs}
            selectedJobId={draftPlayer.jobId}
            onBack={() => setStep(4)}
            onSelectJob={(jobId) => setDraftPlayer((current) => ({ ...current, jobId }))}
            onNext={commitDraftPlayer}
            canAdvance={canAdvanceFromStep5}
          />
        )
      case 6:
        return (
          <NewGameWizardStep6Summary
            createError={createError}
            gameName={gameName}
            isSubmitting={isSubmitting}
            players={players}
            canAddPlayer={canAddPlayer}
            canStartGame={canStartGame}
            onAddPlayer={handleAddAnotherPlayer}
            onGameNameChange={setGameName}
            onStartGame={handleSubmit}
          />
        )
      default:
        return null
    }
  }

  return (
    <section className={`wizard-shell wizard-step-${step}`} data-step={step}>
      <button className="wizard-close" type="button" onClick={onCancel} aria-label="Close modal">
        <X aria-hidden="true" />
      </button>
      <header className="wizard-header">
        <h2 className="wizard-title">{stepTitle}</h2>
        <p className="wizard-subtitle">{stepSubtitle}</p>
      </header>
      {renderBody()}
    </section>
  )
}

export default NewGameWizard
