import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import NewGameWizardStep1GameName from './NewGameWizardStep1GameName'
import NewGameWizardStep1Player from './NewGameWizardStep1Player'
import NewGameWizardStep2City from './NewGameWizardStep2City'
import NewGameWizardStep3Track from './NewGameWizardStep3Track'
import NewGameWizardStep4Job from './NewGameWizardStep4Job'
import NewGameWizardStep6Summary from './NewGameWizardStep6Summary'
import {
  getWizardJobOption,
  getWizardTrackOption,
} from '../../data/wizardVisualCatalog'
import { PLAYER_AVATAR_OPTIONS, getPlayerAvatarOption } from '../../data/playerAvatars'
import './new-game-wizard.css'

const DEFAULT_PLAYER_SELECTIONS = {
  cityId: 'denver',
  educationTrackId: 'trades-track',
  jobId: 'electrician',
}

const clonePlayerSelections = () => ({ ...DEFAULT_PLAYER_SELECTIONS })

const NewGameWizard = ({
  gameName,
  onGameNameChange,
  onGameNameBlur,
  isGameNameValid,
  isGameNameTooLong,
  maxGameNameLength,
  players,
  draftPlayer,
  draftTouched,
  draftErrors,
  maxPlayerNameLength,
  onDraftNameChange,
  onDraftBlur,
  onDraftAvatarCycle,
  onAddPlayer,
  onSubmit,
  onCancel,
  createError,
  isCreating,
}) => {
  const [step, setStep] = useState(1)
  const [currentSelections, setCurrentSelections] = useState(clonePlayerSelections)
  const [playerSelections, setPlayerSelections] = useState([])

  useEffect(() => {
    if (players.length === 0 && step === 6) {
      setStep(2)
    }
  }, [players.length, step])

  const configuredPlayers = useMemo(
    () =>
      players
        .map((player, index) => {
          const config = playerSelections[index]
          if (!config) {
            return null
          }
          const job = getWizardJobOption(config.jobId)
          const track = getWizardTrackOption(config.educationTrackId)
          return {
            id: String(player.id),
            name: player.name,
            avatar: player.avatar,
            cityId: config.cityId,
            educationTrackId: config.educationTrackId,
            jobId: config.jobId,
            careerTrack: job?.careerTrack || track?.label || '',
          }
        })
        .filter(Boolean),
    [playerSelections, players],
  )

  const canStartGame = isGameNameValid && configuredPlayers.length >= 2 && configuredPlayers.length === players.length

  const handleAvatarSelect = (avatarKey) => {
    const currentKey = getPlayerAvatarOption(draftPlayer.avatar)?.key || PLAYER_AVATAR_OPTIONS[0].key
    const currentIndex = PLAYER_AVATAR_OPTIONS.findIndex((option) => option.key === currentKey)
    const nextIndex = PLAYER_AVATAR_OPTIONS.findIndex((option) => option.key === avatarKey)

    if (currentIndex === -1 || nextIndex === -1 || currentIndex === nextIndex) {
      return
    }

    const totalSteps = (nextIndex - currentIndex + PLAYER_AVATAR_OPTIONS.length) % PLAYER_AVATAR_OPTIONS.length
    for (let stepIndex = 0; stepIndex < totalSteps; stepIndex += 1) {
      onDraftAvatarCycle()
    }
  }

  const handleAdvanceFromPlayer = () => {
    if (draftErrors.name) {
      onDraftBlur('name')
      return
    }
    setStep(3)
  }

  const handleCompletePlayer = () => {
    const didAddPlayer = onAddPlayer()
    if (didAddPlayer === false) return
    setPlayerSelections((current) => [...current, currentSelections])
    setCurrentSelections(clonePlayerSelections())
    setStep(6)
  }

  const handleStartGame = () => {
    if (!canStartGame) {
      return
    }

    configuredPlayers.forEach((player, index) => {
      Object.assign(players[index], player)
    })

    onSubmit({
      name: gameName.trim(),
      players: configuredPlayers,
    })
  }

  return (
    <div className="wizard-shell">
      <button className="wizard-close" type="button" onClick={onCancel} aria-label="Close modal">
        <X aria-hidden="true" />
      </button>
      {step === 1 ? (
        <NewGameWizardStep1GameName
          gameName={gameName}
          isGameNameValid={isGameNameValid}
          isGameNameTooLong={isGameNameTooLong}
          maxGameNameLength={maxGameNameLength}
          onGameNameChange={onGameNameChange}
          onGameNameBlur={onGameNameBlur}
          onNext={() => setStep(2)}
        />
      ) : null}
      {step === 2 ? (
        <NewGameWizardStep1Player
          draftPlayer={draftPlayer}
          draftTouched={draftTouched}
          draftErrors={draftErrors}
          maxPlayerNameLength={maxPlayerNameLength}
          onDraftNameChange={onDraftNameChange}
          onDraftBlur={onDraftBlur}
          onAvatarSelect={handleAvatarSelect}
          onNext={handleAdvanceFromPlayer}
        />
      ) : null}
      {step === 3 ? (
        <NewGameWizardStep2City
          selectedCityId={currentSelections.cityId}
          onSelectCity={(cityId) => setCurrentSelections((current) => ({ ...current, cityId }))}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      ) : null}
      {step === 4 ? (
        <NewGameWizardStep3Track
          selectedTrackId={currentSelections.educationTrackId}
          onSelectTrack={(educationTrackId) => setCurrentSelections((current) => ({ ...current, educationTrackId }))}
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      ) : null}
      {step === 5 ? (
        <NewGameWizardStep4Job
          selectedJobId={currentSelections.jobId}
          onSelectJob={(jobId) => setCurrentSelections((current) => ({ ...current, jobId }))}
          onBack={() => setStep(4)}
          onNext={handleCompletePlayer}
        />
      ) : null}
      {step === 6 ? (
        <NewGameWizardStep6Summary
          gameName={gameName}
          maxGameNameLength={maxGameNameLength}
          onGameNameChange={onGameNameChange}
          onGameNameBlur={onGameNameBlur}
          players={configuredPlayers}
          canStartGame={canStartGame}
          isCreating={isCreating}
          onAddAnotherPlayer={() => setStep(2)}
          onStartGame={handleStartGame}
        />
      ) : null}
      {createError ? (
        <p className="wizard-global-error" role="alert">
          {createError}
        </p>
      ) : null}
    </div>
  )
}

export default NewGameWizard
