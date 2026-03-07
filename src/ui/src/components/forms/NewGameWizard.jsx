import { useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { X } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import {
  DEFAULT_PLAYER_AVATAR_KEY,
  getNextAvailablePlayerAvatarKey,
  getNextPlayerAvatarKey,
} from '../../data/playerAvatars'
import {
  DEFAULT_WIZARD_CITY_ID,
  DEFAULT_WIZARD_JOB_ID,
  DEFAULT_WIZARD_TRACK_ID,
  getWizardTrackById,
} from '../../data/wizardVisualCatalog'
import NewGameWizardStep1GameName from './NewGameWizardStep1GameName'
import NewGameWizardStep1Player from './NewGameWizardStep1Player'
import NewGameWizardStep2City from './NewGameWizardStep2City'
import NewGameWizardStep3Track from './NewGameWizardStep3Track'
import NewGameWizardStep4Job from './NewGameWizardStep4Job'
import NewGameWizardStep6Summary from './NewGameWizardStep6Summary'

const MIN_PLAYERS = 2

const createEmptyDraft = (index) => ({
  id: `wizard-player-${index}`,
  name: '',
  avatar: DEFAULT_PLAYER_AVATAR_KEY,
  cityId: DEFAULT_WIZARD_CITY_ID,
  educationTrackId: DEFAULT_WIZARD_TRACK_ID,
  jobId: DEFAULT_WIZARD_JOB_ID,
})

const getGameNameError = (name, maxGameNameLength) => {
  const trimmed = name.trim()
  if (!trimmed) {
    return 'Game name is required.'
  }
  if (trimmed.length > maxGameNameLength) {
    return `Name must be ${maxGameNameLength} characters or fewer.`
  }
  return ''
}

const getPlayerNameError = (draftName, players, maxPlayerNameLength) => {
  const trimmed = draftName.trim()
  if (!trimmed) {
    return 'Player name is required.'
  }
  if (trimmed.length > maxPlayerNameLength) {
    return `Name must be ${maxPlayerNameLength} characters or fewer.`
  }

  const duplicate = players.some((player) => player.name.trim().toLowerCase() === trimmed.toLowerCase())
  if (duplicate) {
    return 'Names must be unique.'
  }
  return ''
}

const alignParentDraftAvatar = ({
  currentAvatar,
  targetAvatar,
  unavailableAvatars,
  onDraftAvatarCycle,
}) => {
  if (currentAvatar === targetAvatar) {
    return currentAvatar
  }

  let nextAvatar = currentAvatar
  for (let count = 0; count < 40 && nextAvatar !== targetAvatar; count += 1) {
    nextAvatar = getNextAvailablePlayerAvatarKey(
      getNextPlayerAvatarKey(nextAvatar),
      unavailableAvatars,
    )
    flushSync(() => onDraftAvatarCycle())
  }

  return nextAvatar
}

const NewGameWizard = ({
  isOpen,
  isCreating,
  onCancel,
  onSubmit,
  gameName,
  maxGameNameLength,
  maxPlayerNameLength,
  players: parentPlayers,
  draftPlayer,
  onGameNameChange,
  onDraftNameChange,
  onDraftAvatarCycle,
  onAddPlayer,
  onRemovePlayer,
}) => {
  const [step, setStep] = useState(1)
  const [wizardName, setWizardName] = useState('')
  const [configuredPlayers, setConfiguredPlayers] = useState([])
  const [draftPlayerState, setDraftPlayerState] = useState(createEmptyDraft(1))
  const [nextPlayerIndex, setNextPlayerIndex] = useState(2)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setStep(1)
    setWizardName(gameName || '')
    setConfiguredPlayers([])
    setDraftPlayerState(createEmptyDraft(1))
    setNextPlayerIndex(2)
  }, [isOpen])

  const trimmedWizardName = wizardName.trim()
  const gameNameError = getGameNameError(wizardName, maxGameNameLength)
  const playerNameError = getPlayerNameError(
    draftPlayerState.name,
    configuredPlayers,
    maxPlayerNameLength,
  )

  const summaryPlayers = useMemo(() => configuredPlayers, [configuredPlayers])
  const selectedTrack = getWizardTrackById(draftPlayerState.educationTrackId)

  const syncNameToParent = (value) => {
    setWizardName(value)
    onGameNameChange({ target: { value } })
  }

  const finalizeCurrentPlayer = () => {
    const normalizedPlayer = {
      ...draftPlayerState,
      name: draftPlayerState.name.trim(),
      careerTrack: selectedTrack.title,
    }
    setConfiguredPlayers((current) => [...current, normalizedPlayer])
    setDraftPlayerState(createEmptyDraft(nextPlayerIndex))
    setNextPlayerIndex((current) => current + 1)
    setStep(6)
  }

  const handleNext = () => {
    if (step === 1) {
      if (gameNameError) {
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      if (playerNameError) {
        return
      }
      setStep(3)
      return
    }

    if (step === 3 || step === 4) {
      setStep(step + 1)
      return
    }

    if (step === 5) {
      finalizeCurrentPlayer()
    }
  }

  const handleBack = () => {
    if (step === 1) {
      return
    }
    setStep((current) => Math.max(1, current - 1))
  }

  const handleAddAnotherPlayer = () => {
    setStep(2)
  }

  const syncWizardToParent = (payload) => {
    flushSync(() => onGameNameChange({ target: { value: payload.name } }))

    parentPlayers.forEach((player) => {
      flushSync(() => onRemovePlayer(player.id))
    })

    let currentDraftAvatar = draftPlayer?.avatar || DEFAULT_PLAYER_AVATAR_KEY
    const syncedPlayers = []

    payload.players.forEach((player) => {
      flushSync(() => onDraftNameChange({ target: { value: player.name } }))
      currentDraftAvatar = alignParentDraftAvatar({
        currentAvatar: currentDraftAvatar,
        targetAvatar: player.avatar,
        unavailableAvatars: syncedPlayers.map((entry) => entry.avatar),
        onDraftAvatarCycle,
      })
      flushSync(() => onAddPlayer())
      syncedPlayers.push(player)
      currentDraftAvatar = getNextAvailablePlayerAvatarKey(
        currentDraftAvatar,
        syncedPlayers.map((entry) => entry.avatar),
      )
    })
  }

  const handleStartGame = () => {
    if (gameNameError || summaryPlayers.length < MIN_PLAYERS) {
      return
    }

    const payload = {
      name: trimmedWizardName,
      players: summaryPlayers.map((player) => ({
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        cityId: player.cityId,
        educationTrackId: player.educationTrackId,
        jobId: player.jobId,
        careerTrack: player.careerTrack,
      })),
    }

    syncWizardToParent(payload)
    onSubmit(payload)
  }

  const shellTitle =
    step === 1
      ? 'New Game Setup'
      : step === 2
        ? 'New Player Setup'
        : step === 3
          ? 'New Player Setup - Pick City'
          : step === 4
            ? 'New Player Setup - Education Track'
            : step === 5
              ? 'New Player Setup - Pick a Career'
              : 'New Game - Summary'

  const footerContent =
    step === 1 ? (
      <div className="wizard-footer wizard-footer-centered">
        <PrimaryButton disabled={Boolean(gameNameError) || isCreating} onClick={handleNext}>
          Next
        </PrimaryButton>
      </div>
    ) : step === 6 ? (
      <div className="wizard-footer wizard-footer-summary">
        <SecondaryButton disabled={isCreating} onClick={handleAddAnotherPlayer}>
          + New Player
        </SecondaryButton>
        <PrimaryButton
          disabled={Boolean(gameNameError) || summaryPlayers.length < MIN_PLAYERS || isCreating}
          onClick={handleStartGame}
        >
          {isCreating ? 'Creating...' : 'Start Game'}
        </PrimaryButton>
      </div>
    ) : (
      <div className="wizard-footer">
        <SecondaryButton disabled={isCreating} onClick={handleBack}>
          Back
        </SecondaryButton>
        <PrimaryButton
          disabled={(step === 2 && Boolean(playerNameError)) || isCreating}
          onClick={handleNext}
        >
          Next
        </PrimaryButton>
      </div>
    )

  return (
    <div className="wizard-shell">
      <button className="wizard-close" onClick={onCancel} type="button" aria-label="Close modal">
        <X aria-hidden="true" />
      </button>
      <header className="wizard-header">
        <h2>{shellTitle}</h2>
        <p>{`Step ${step} of 6`}</p>
      </header>

      <div className="wizard-body">
        {step === 1 ? (
          <NewGameWizardStep1GameName
            disabled={isCreating}
            error={gameNameError}
            gameName={wizardName}
            maxGameNameLength={maxGameNameLength}
            onChange={syncNameToParent}
          />
        ) : null}
        {step === 2 ? (
          <NewGameWizardStep1Player
            disabled={isCreating}
            maxPlayerNameLength={maxPlayerNameLength}
            nameError={playerNameError}
            onAvatarSelect={(avatar) => setDraftPlayerState((current) => ({ ...current, avatar }))}
            onNameChange={(name) => setDraftPlayerState((current) => ({ ...current, name }))}
            playerName={draftPlayerState.name}
            selectedAvatar={draftPlayerState.avatar}
          />
        ) : null}
        {step === 3 ? (
          <NewGameWizardStep2City
            disabled={isCreating}
            onSelect={(cityId) => setDraftPlayerState((current) => ({ ...current, cityId }))}
            selectedCityId={draftPlayerState.cityId}
          />
        ) : null}
        {step === 4 ? (
          <NewGameWizardStep3Track
            disabled={isCreating}
            onSelect={(educationTrackId) =>
              setDraftPlayerState((current) => ({ ...current, educationTrackId }))
            }
            selectedTrackId={draftPlayerState.educationTrackId}
          />
        ) : null}
        {step === 5 ? (
          <NewGameWizardStep4Job
            disabled={isCreating}
            onSelect={(jobId) => setDraftPlayerState((current) => ({ ...current, jobId }))}
            selectedJobId={draftPlayerState.jobId}
          />
        ) : null}
        {step === 6 ? (
          <NewGameWizardStep6Summary
            disabled={isCreating}
            gameName={wizardName}
            maxGameNameLength={maxGameNameLength}
            nameError={gameNameError}
            onNameChange={syncNameToParent}
            players={summaryPlayers}
          />
        ) : null}
      </div>

      {step === 6 && summaryPlayers.length < MIN_PLAYERS ? (
        <p className="wizard-helper-copy">Add at least two players before starting the game.</p>
      ) : null}
      {footerContent}
    </div>
  )
}

export default NewGameWizard
