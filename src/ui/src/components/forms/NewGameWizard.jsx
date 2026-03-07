import { useEffect, useMemo, useRef, useState } from 'react'
import { getGameNameError } from '../../utils/gameValidation'
import {
  CITY_OPTIONS,
  EDUCATION_TRACK_OPTIONS,
  JOB_OPTIONS,
  findById,
} from '../../data/wizardVisualCatalog'
import {
  PLAYER_AVATAR_OPTIONS,
  getPlayerAvatarOption,
} from '../../data/playerAvatars'
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

const MAX_STEPS = 6

const getAvatarAdvanceCount = ({ currentAvatarKey, targetAvatarKey, unavailableValues }) => {
  if (!targetAvatarKey || currentAvatarKey === targetAvatarKey) {
    return 0
  }

  const blocked = new Set(
    unavailableValues
      .map((value) => getPlayerAvatarOption(value)?.key || null)
      .filter(Boolean),
  )
  const allowed = PLAYER_AVATAR_OPTIONS.filter((option) => !blocked.has(option.key)).map((option) => option.key)

  if (!allowed.includes(currentAvatarKey) || !allowed.includes(targetAvatarKey)) {
    return 0
  }

  const currentIndex = allowed.indexOf(currentAvatarKey)
  const targetIndex = allowed.indexOf(targetAvatarKey)
  if (currentIndex === -1 || targetIndex === -1) {
    return 0
  }

  return (targetIndex - currentIndex + allowed.length) % allowed.length
}

const NewGameWizard = ({
  gameName,
  onGameNameChange,
  onGameNameBlur,
  gameNameTouched,
  isGameNameValid,
  isGameNameTooLong,
  maxGameNameLength,
  players,
  maxPlayerNameLength,
  draftPlayer,
  draftTouched,
  draftErrors,
  onAddPlayer,
  onRemovePlayer,
  onDraftNameChange,
  onDraftBlur,
  onDraftAvatarCycle,
  onSubmit,
  onCancel,
  isCreating,
}) => {
  const [step, setStep] = useState(1)
  const [editingPlayerId, setEditingPlayerId] = useState(players[0]?.id || null)
  const [playerSelections, setPlayerSelections] = useState({})
  const previousPlayerCountRef = useRef(players.length)

  const gameNameError = getGameNameError({
    isValid: isGameNameValid,
    isTooLong: isGameNameTooLong,
    maxLength: maxGameNameLength,
  })

  useEffect(() => {
    const previousCount = previousPlayerCountRef.current
    if (players.length > previousCount) {
      setEditingPlayerId(players[players.length - 1]?.id || null)
    } else if (players.length === 0) {
      setEditingPlayerId(null)
      if (step > 2) {
        setStep(2)
      }
    } else if (!players.some((player) => player.id === editingPlayerId)) {
      setEditingPlayerId(players[0]?.id || null)
    }

    previousPlayerCountRef.current = players.length
  }, [players, editingPlayerId, step])

  useEffect(() => {
    setPlayerSelections((current) => {
      const next = {}
      players.forEach((player) => {
        next[player.id] = current[player.id] || {}
      })
      return next
    })
  }, [players])

  const activePlayer = players.find((player) => player.id === editingPlayerId) || players[0] || null
  const activeSelection = activePlayer ? playerSelections[activePlayer.id] || {} : {}

  const playerSummaries = useMemo(
    () =>
      players.reduce((accumulator, player) => {
        const selection = playerSelections[player.id] || {}
        accumulator[player.id] = {
          city: findById(CITY_OPTIONS, selection.cityId)?.title,
          education: findById(EDUCATION_TRACK_OPTIONS, selection.educationTrackId)?.title,
          job: findById(JOB_OPTIONS, selection.jobId)?.title,
        }
        return accumulator
      }, {}),
    [players, playerSelections],
  )

  const canStart =
    isGameNameValid &&
    players.length >= 2 &&
    players.every((player) => {
      const selection = playerSelections[player.id] || {}
      return Boolean(selection.cityId && selection.educationTrackId && selection.jobId)
    })

  const goToPreviousStep = () => setStep((current) => Math.max(1, current - 1))

  const updateSelection = (field, value) => {
    if (!activePlayer) {
      return
    }
    setPlayerSelections((current) => ({
      ...current,
      [activePlayer.id]: {
        ...(current[activePlayer.id] || {}),
        [field]: value,
      },
    }))
  }

  const handleAvatarSelect = (targetAvatarKey) => {
    const unavailable = players.map((player) => player.avatar)
    const steps = getAvatarAdvanceCount({
      currentAvatarKey: getPlayerAvatarOption(draftPlayer.avatar)?.key || PLAYER_AVATAR_OPTIONS[0].key,
      targetAvatarKey,
      unavailableValues: unavailable,
    })

    if (steps === 0) {
      return
    }

    for (let index = 0; index < steps; index += 1) {
      onDraftAvatarCycle()
    }
  }

  const handleStart = () => {
    if (!canStart) {
      return
    }

    const payload = {
      name: gameName.trim(),
      players: players.map((player) => {
        const selection = playerSelections[player.id] || {}
        const job = findById(JOB_OPTIONS, selection.jobId)

        return {
          id: String(player.id),
          name: player.name.trim(),
          avatar: player.avatar,
          cityId: selection.cityId,
          educationTrackId: selection.educationTrackId,
          jobId: selection.jobId,
          careerTrack: job?.careerTrack || null,
        }
      }),
    }

    onSubmit(payload)
  }

  const subtitle = `Step ${step} of ${MAX_STEPS}`

  return (
    <div className="wizard-shell">
      <div className="wizard-header">
        <h2 id="wizard-title" className="wizard-title">
          {STEP_TITLES[step]}
        </h2>
        <p className="wizard-subtitle">{subtitle}</p>
      </div>

      <div className="wizard-body">
        {step === 1 ? (
          <NewGameWizardStep1GameName
            gameName={gameName}
            maxGameNameLength={maxGameNameLength}
            isGameNameValid={isGameNameValid}
            gameNameTouched={gameNameTouched}
            gameNameError={gameNameError}
            isBusy={isCreating}
            onGameNameChange={onGameNameChange}
            onGameNameBlur={onGameNameBlur}
            onNext={() => setStep(2)}
          />
        ) : null}

        {step === 2 ? (
          <NewGameWizardStep1Player
            players={players}
            draftPlayer={draftPlayer}
            draftTouched={draftTouched}
            draftErrors={draftErrors}
            maxPlayerNameLength={maxPlayerNameLength}
            isCreating={isCreating}
            editingPlayerId={editingPlayerId}
            onDraftNameChange={onDraftNameChange}
            onDraftBlur={onDraftBlur}
            onSelectAvatar={handleAvatarSelect}
            onSelectPlayer={setEditingPlayerId}
            onAddPlayer={onAddPlayer}
            onRemovePlayer={onRemovePlayer}
            onBack={goToPreviousStep}
            onNext={() => setStep(3)}
          />
        ) : null}

        {step === 3 ? (
          <NewGameWizardStep2City
            options={CITY_OPTIONS}
            selectedCityId={activeSelection.cityId}
            activePlayerName={activePlayer?.name}
            onSelect={(cityId) => updateSelection('cityId', cityId)}
            onBack={goToPreviousStep}
            onNext={() => setStep(4)}
          />
        ) : null}

        {step === 4 ? (
          <NewGameWizardStep3Track
            options={EDUCATION_TRACK_OPTIONS}
            selectedEducationTrackId={activeSelection.educationTrackId}
            activePlayerName={activePlayer?.name}
            onSelect={(educationTrackId) => updateSelection('educationTrackId', educationTrackId)}
            onBack={goToPreviousStep}
            onNext={() => setStep(5)}
          />
        ) : null}

        {step === 5 ? (
          <NewGameWizardStep4Job
            options={JOB_OPTIONS}
            selectedJobId={activeSelection.jobId}
            activePlayerName={activePlayer?.name}
            onSelect={(jobId) => updateSelection('jobId', jobId)}
            onBack={goToPreviousStep}
            onNext={() => setStep(6)}
          />
        ) : null}

        {step === 6 ? (
          <NewGameWizardStep6Summary
            gameName={gameName}
            maxGameNameLength={maxGameNameLength}
            gameNameTouched={gameNameTouched}
            gameNameError={gameNameError}
            isGameNameValid={isGameNameValid}
            players={players}
            playerSummaries={playerSummaries}
            canStart={canStart}
            isCreating={isCreating}
            onGameNameChange={onGameNameChange}
            onGameNameBlur={onGameNameBlur}
            onBack={goToPreviousStep}
            onAddNewPlayer={() => setStep(2)}
            onStart={handleStart}
          />
        ) : null}
      </div>

      <button type="button" className="wizard-close" onClick={onCancel} aria-label="Close setup wizard">
        x
      </button>
    </div>
  )
}

export default NewGameWizard
