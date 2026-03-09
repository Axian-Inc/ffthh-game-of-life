import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CITY_BY_ID,
  CITY_OPTIONS,
  DEFAULT_WIZARD_SELECTIONS,
  EDUCATION_TRACK_OPTIONS,
  JOB_BY_ID,
  JOB_OPTIONS,
  TRACK_BY_ID,
} from '../../data/wizardVisualCatalog'
import { PLAYER_AVATAR_OPTIONS, getPlayerAvatarOption } from '../../data/playerAvatars'
import NewGameWizardStep1GameName from './NewGameWizardStep1GameName'
import NewGameWizardStep1Player from './NewGameWizardStep1Player'
import NewGameWizardStep2City from './NewGameWizardStep2City'
import NewGameWizardStep3Track from './NewGameWizardStep3Track'
import NewGameWizardStep4Job from './NewGameWizardStep4Job'
import NewGameWizardStep6Summary from './NewGameWizardStep6Summary'
import './new-game-wizard.css'

const TITLES_BY_STEP = {
  1: 'New Game Setup',
  2: 'New Player Setup',
  3: 'New Player Setup - Pick City',
  4: 'New Player Setup - Education Track',
  5: 'New Player Setup - Pick a Career',
  6: 'New Game - Summary',
}

const buildPlayerMetaMap = (players) =>
  Object.fromEntries(
    players.map((player) => [
      String(player.id),
      {
        cityId: player.cityId || DEFAULT_WIZARD_SELECTIONS.cityId,
        educationTrackId: player.educationTrackId || DEFAULT_WIZARD_SELECTIONS.educationTrackId,
        jobId: player.jobId || DEFAULT_WIZARD_SELECTIONS.jobId,
      },
    ]),
  )

const NewGameWizard = ({
  onCancel,
  onSubmit,
  gameName,
  onGameNameChange,
  onGameNameBlur,
  isGameNameValid,
  players,
  draftPlayer,
  draftTouched,
  draftErrors,
  onAddPlayer,
  onDraftNameChange,
  onDraftBlur,
  onDraftAvatarSelect,
  onDraftAvatarCycle,
  isCreating,
}) => {
  const [step, setStep] = useState(1)
  const [draftSelections, setDraftSelections] = useState(DEFAULT_WIZARD_SELECTIONS)
  const [playerMetaById, setPlayerMetaById] = useState(() => buildPlayerMetaMap(players))
  const [pendingPlayerMeta, setPendingPlayerMeta] = useState(null)
  const previousPlayerCountRef = useRef(players.length)

  useEffect(() => {
    setPlayerMetaById((current) => ({
      ...buildPlayerMetaMap(players),
      ...current,
    }))
  }, [players])

  useEffect(() => {
    const previousCount = previousPlayerCountRef.current
    if (pendingPlayerMeta && players.length > previousCount) {
      const latestPlayer = players[players.length - 1]
      setPlayerMetaById((current) => ({
        ...current,
        [String(latestPlayer.id)]: pendingPlayerMeta,
      }))
      setPendingPlayerMeta(null)
    }
    previousPlayerCountRef.current = players.length
  }, [players, pendingPlayerMeta])

  const subtitle = `Step ${step} of 6`
  const title = TITLES_BY_STEP[step]

  const normalizedDraftAvatar = getPlayerAvatarOption(draftPlayer.avatar)?.key || PLAYER_AVATAR_OPTIONS[0].key
  const trimmedDraftName = draftPlayer.name.trim()
  const lowerDraftName = trimmedDraftName.toLowerCase()
  const hasDuplicateDraftName =
    lowerDraftName.length > 0 && players.some((player) => player.name.trim().toLowerCase() === lowerDraftName)

  const effectiveDraftErrors = {
    ...draftErrors,
    name: hasDuplicateDraftName ? 'Names must be unique.' : draftErrors?.name,
  }

  const mergedPlayers = useMemo(
    () =>
      players.map((player) => {
        const metadata = playerMetaById[String(player.id)] || DEFAULT_WIZARD_SELECTIONS
        const job = JOB_BY_ID[metadata.jobId]
        return {
          ...player,
          cityId: metadata.cityId,
          educationTrackId: metadata.educationTrackId,
          jobId: metadata.jobId,
          careerTrack: job?.careerTrack || 'Street Smart',
        }
      }),
    [players, playerMetaById],
  )

  const canAdvanceFromStep1 = gameName.trim().length > 0 && isGameNameValid
  const canAdvanceFromStep2 = trimmedDraftName.length > 0 && !hasDuplicateDraftName
  const canStartGame = gameName.trim().length > 0 && isGameNameValid && mergedPlayers.length >= 2

  const applyDraftAvatar = (targetAvatarKey) => {
    if (onDraftAvatarSelect) {
      onDraftAvatarSelect(targetAvatarKey)
      return
    }

    const currentIndex = PLAYER_AVATAR_OPTIONS.findIndex((option) => option.key === normalizedDraftAvatar)
    const targetIndex = PLAYER_AVATAR_OPTIONS.findIndex((option) => option.key === targetAvatarKey)
    if (targetIndex < 0 || currentIndex < 0 || targetIndex === currentIndex) {
      return
    }

    const steps = (targetIndex - currentIndex + PLAYER_AVATAR_OPTIONS.length) % PLAYER_AVATAR_OPTIONS.length
    for (let index = 0; index < steps; index += 1) {
      onDraftAvatarCycle()
    }
  }

  const goBack = () => {
    if (step <= 1) {
      return
    }
    setStep((current) => current - 1)
  }

  const goNext = () => {
    if (step === 1) {
      onGameNameBlur()
      if (!canAdvanceFromStep1) {
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      onDraftBlur()
      if (!canAdvanceFromStep2) {
        return
      }
      setStep(3)
      return
    }

    if (step === 5) {
      setPendingPlayerMeta(draftSelections)
      onAddPlayer()
      setStep(6)
      return
    }

    setStep((current) => Math.min(6, current + 1))
  }

  const onAddAnotherPlayer = () => {
    onDraftNameChange({ target: { value: '' } })
    setDraftSelections(DEFAULT_WIZARD_SELECTIONS)
    setStep(2)
  }

  const handleStartGame = () => {
    if (!canStartGame) {
      return
    }

    const payload = {
      name: gameName.trim(),
      players: mergedPlayers.map((player) => ({
        id: String(player.id),
        name: player.name.trim(),
        avatar: player.avatar,
        cityId: player.cityId,
        educationTrackId: player.educationTrackId,
        jobId: player.jobId,
        careerTrack: player.careerTrack,
      })),
    }

    onSubmit(payload)
  }

  return (
    <div className="wizard-shell" data-step={step}>
      <button className="wizard-close" type="button" onClick={onCancel} aria-label="Close modal">
        ×
      </button>

      <header className="wizard-header">
        <h2 className="wizard-title">{title}</h2>
        <p className="wizard-subtitle">{subtitle}</p>
      </header>

      <div className="wizard-body">
        {step === 1 ? (
          <NewGameWizardStep1GameName
            gameName={gameName}
            onGameNameChange={onGameNameChange}
            onGameNameBlur={onGameNameBlur}
            isGameNameValid={isGameNameValid}
            isCreating={isCreating}
          />
        ) : null}

        {step === 2 ? (
          <NewGameWizardStep1Player
            draftPlayer={draftPlayer}
            draftErrors={effectiveDraftErrors}
            draftTouched={draftTouched}
            onDraftNameChange={onDraftNameChange}
            onDraftBlur={onDraftBlur}
            onAvatarSelect={applyDraftAvatar}
            avatars={PLAYER_AVATAR_OPTIONS}
            isCreating={isCreating}
          />
        ) : null}

        {step === 3 ? (
          <NewGameWizardStep2City
            cityOptions={CITY_OPTIONS}
            selectedCityId={draftSelections.cityId}
            onSelectCity={(cityId) => setDraftSelections((current) => ({ ...current, cityId }))}
          />
        ) : null}

        {step === 4 ? (
          <NewGameWizardStep3Track
            trackOptions={EDUCATION_TRACK_OPTIONS}
            selectedTrackId={draftSelections.educationTrackId}
            onSelectTrack={(educationTrackId) => setDraftSelections((current) => ({ ...current, educationTrackId }))}
          />
        ) : null}

        {step === 5 ? (
          <NewGameWizardStep4Job
            jobOptions={JOB_OPTIONS}
            selectedJobId={draftSelections.jobId}
            onSelectJob={(jobId) => setDraftSelections((current) => ({ ...current, jobId }))}
          />
        ) : null}

        {step === 6 ? (
          <NewGameWizardStep6Summary
            players={mergedPlayers}
            cityById={CITY_BY_ID}
            trackById={TRACK_BY_ID}
            jobById={JOB_BY_ID}
            gameName={gameName}
            onGameNameChange={onGameNameChange}
            onGameNameBlur={onGameNameBlur}
          />
        ) : null}
      </div>

      {step < 6 ? (
        <footer className={`wizard-footer ${step === 1 ? 'wizard-footer-center' : ''}`} data-step={step}>
          {step > 1 ? (
            <button type="button" className="wizard-btn wizard-btn-secondary" onClick={goBack}>
              Back
            </button>
          ) : null}
          <button
            type="button"
            className="wizard-btn wizard-btn-primary"
            onClick={goNext}
            disabled={(step === 1 && !canAdvanceFromStep1) || (step === 2 && !canAdvanceFromStep2) || isCreating}
          >
            Next
          </button>
        </footer>
      ) : (
        <footer className="wizard-footer wizard-footer-summary" data-step={step}>
          <button type="button" className="wizard-btn wizard-btn-secondary" onClick={onAddAnotherPlayer}>
            + New Player
          </button>
          <button
            type="button"
            className="wizard-btn wizard-btn-primary"
            onClick={handleStartGame}
            disabled={!canStartGame || isCreating}
          >
            Start Game
          </button>
        </footer>
      )}
    </div>
  )
}

export default NewGameWizard
