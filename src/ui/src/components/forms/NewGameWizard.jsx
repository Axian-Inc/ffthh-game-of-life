import { useEffect, useRef, useState } from 'react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import NewGameWizardStep1Player from './NewGameWizardStep1Player'
import NewGameWizardStep2City from './NewGameWizardStep2City'
import NewGameWizardStep3Track from './NewGameWizardStep3Track'
import NewGameWizardStep4Job from './NewGameWizardStep4Job'
import NewGameWizardStep5Summary from './NewGameWizardStep5Summary'
import {
  getWizardCity,
  getWizardJob,
  getWizardPersona,
  getWizardTrack,
  wizardPersonas,
} from '../../data/wizardVisualCatalog'
import './new-game-wizard.css'

const defaultDraftPlayer = () => ({
  name: '',
  avatar: wizardPersonas[0].id,
  cityId: 'denver',
  educationTrackId: 'trades-track',
  jobId: 'electrician',
})

const stepMeta = {
  1: { title: 'New Player Setup', subtitle: 'Step 1 of 5' },
  2: { title: 'New Player Setup - Pick City', subtitle: 'Step 2 of 5' },
  3: { title: 'New Player Setup - Education Track', subtitle: 'Step 3 of 5' },
  4: { title: 'New Player Setup - Pick a Career', subtitle: 'Step 4 of 5' },
  5: { title: 'New Game - Summary', subtitle: 'Step 5 of 5' },
}

const getTrackTitle = (trackId) => getWizardTrack(trackId).title

const buildCommittedPlayer = (player, index) => ({
  id: `wizard-player-${index + 1}`,
  name: player.name.trim(),
  avatar: player.avatar,
  cityId: player.cityId,
  educationTrackId: player.educationTrackId,
  jobId: player.jobId,
  careerTrack: getTrackTitle(player.educationTrackId),
})

const NewGameWizard = ({
  players: externalPlayers,
  draftPlayer,
  onDraftNameChange,
  onAddPlayer,
  onSubmit,
  onGameNameChange,
  onClose,
  createError,
  isCreating,
  visualState = null,
}) => {
  const [wizardState, setWizardState] = useState({
    currentStep: visualState?.step || 1,
    players: visualState?.players || [],
    draftPlayer: visualState?.draftPlayer || defaultDraftPlayer(),
  })
  const [nameTouched, setNameTouched] = useState(false)
  const pendingCommitRef = useRef(null)
  const previousExternalCountRef = useRef(externalPlayers.length)

  useEffect(() => {
    if (visualState) {
      return
    }
    if (!draftPlayer?.name && onGameNameChange) {
      onGameNameChange({ target: { value: 'Choices Matter' } })
    }
  }, [draftPlayer?.name, onGameNameChange, visualState])

  useEffect(() => {
    if (visualState) {
      return
    }
    const previousCount = previousExternalCountRef.current
    if (pendingCommitRef.current && externalPlayers.length > previousCount) {
      const newestPlayer = externalPlayers[externalPlayers.length - 1]
      if (newestPlayer) {
        Object.assign(newestPlayer, pendingCommitRef.current)
      }
      pendingCommitRef.current = null
    }
    previousExternalCountRef.current = externalPlayers.length
  }, [externalPlayers, visualState])

  const currentStep = wizardState.currentStep
  const currentDraft = wizardState.draftPlayer
  const currentMeta = stepMeta[currentStep]
  const selectedTrackJobs = currentDraft.educationTrackId

  const updateDraftPlayer = (patch) => {
    setWizardState((current) => ({
      ...current,
      draftPlayer: { ...current.draftPlayer, ...patch },
    }))
  }

  const handleNameChange = (event) => {
    updateDraftPlayer({ name: event.target.value })
  }

  const goToStep = (step) => {
    setWizardState((current) => ({ ...current, currentStep: step }))
  }

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 5) {
      goToStep(currentStep - 1)
    }
  }

  const commitCurrentPlayer = () => {
    const committedPlayer = buildCommittedPlayer(currentDraft, wizardState.players.length)
    if (!visualState) {
      if (draftPlayer) {
        draftPlayer.avatar = currentDraft.avatar
        draftPlayer.cityId = currentDraft.cityId
        draftPlayer.educationTrackId = currentDraft.educationTrackId
        draftPlayer.jobId = currentDraft.jobId
      }
      if (onDraftNameChange) {
        onDraftNameChange({ target: { value: currentDraft.name } })
      }
      pendingCommitRef.current = committedPlayer
      onAddPlayer()
    }
    setWizardState((current) => ({
      currentStep: 5,
      players: [...current.players, committedPlayer],
      draftPlayer: defaultDraftPlayer(),
    }))
    setNameTouched(false)
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!currentDraft.name.trim()) {
        setNameTouched(true)
        return
      }
      goToStep(2)
      return
    }
    if (currentStep === 2) {
      goToStep(3)
      return
    }
    if (currentStep === 3) {
      const defaultJob = getWizardJob(currentDraft.jobId)
      if (defaultJob.educationTrackId !== currentDraft.educationTrackId) {
        const fallbackJob = getWizardJob(
          currentDraft.educationTrackId === 'degree-track'
            ? 'veterinarian'
            : currentDraft.educationTrackId === 'self-taught-track'
              ? 'designer'
              : 'electrician',
        )
        updateDraftPlayer({ jobId: fallbackJob.id })
      }
      goToStep(4)
      return
    }
    if (currentStep === 4) {
      commitCurrentPlayer()
    }
  }

  const handleAddNewPlayer = () => {
    setWizardState((current) => ({
      ...current,
      currentStep: 1,
      draftPlayer: defaultDraftPlayer(),
    }))
    setNameTouched(false)
  }

  const handleStartGame = () => {
    wizardState.players.forEach((player, index) => {
      const externalPlayer = externalPlayers[index]
      if (externalPlayer) {
        Object.assign(externalPlayer, player)
      }
    })
    onSubmit()
  }

  const isStepValid =
    currentStep === 1
      ? currentDraft.name.trim().length > 0
      : currentStep === 2
        ? Boolean(currentDraft.cityId)
        : currentStep === 3
          ? Boolean(currentDraft.educationTrackId)
          : currentStep === 4
            ? Boolean(currentDraft.jobId && selectedTrackJobs)
            : wizardState.players.length >= 2

  return (
    <div className={`wizard-shell wizard-step-${currentStep}`} data-current-step={currentStep}>
      <div className="wizard-header">
        <button className="modal-close wizard-close" type="button" onClick={onClose} aria-label="Close modal">
          x
        </button>
        <h2 className="modal-title wizard-title">{currentMeta.title}</h2>
        <p className="modal-subtitle wizard-subtitle">{currentMeta.subtitle}</p>
      </div>

      <div className="wizard-stage">
        {currentStep === 1 ? (
          <NewGameWizardStep1Player
            playerName={currentDraft.name}
            selectedPersonaId={currentDraft.avatar}
            onNameChange={handleNameChange}
            onNameBlur={() => setNameTouched(true)}
            onPersonaSelect={(avatar) => updateDraftPlayer({ avatar })}
            showNameError={nameTouched && !currentDraft.name.trim()}
          />
        ) : null}
        {currentStep === 2 ? (
          <NewGameWizardStep2City
            selectedCityId={currentDraft.cityId}
            onSelect={(cityId) => updateDraftPlayer({ cityId })}
          />
        ) : null}
        {currentStep === 3 ? (
          <NewGameWizardStep3Track
            selectedTrackId={currentDraft.educationTrackId}
            onSelect={(educationTrackId) => {
              const fallbackJobId =
                educationTrackId === 'degree-track'
                  ? 'veterinarian'
                  : educationTrackId === 'self-taught-track'
                    ? 'designer'
                    : 'electrician'
              updateDraftPlayer({ educationTrackId, jobId: fallbackJobId })
            }}
          />
        ) : null}
        {currentStep === 4 ? (
          <NewGameWizardStep4Job
            selectedTrackId={currentDraft.educationTrackId}
            selectedJobId={currentDraft.jobId}
            onSelect={(jobId) => updateDraftPlayer({ jobId })}
          />
        ) : null}
        {currentStep === 5 ? (
          <NewGameWizardStep5Summary players={wizardState.players} visualFixture={visualState?.summaryFixture} />
        ) : null}
      </div>

      {createError ? (
        <p className="wizard-error wizard-error-global" role="alert">
          {createError}
        </p>
      ) : null}

      <div className={`modal-footer wizard-footer wizard-footer-step-${currentStep}`}>
        {currentStep === 5 ? (
          <>
            <SecondaryButton className="wizard-button wizard-button-secondary" onClick={handleAddNewPlayer}>
              + New Player
            </SecondaryButton>
            <PrimaryButton
              className="wizard-button"
              disabled={!isStepValid || isCreating}
              onClick={handleStartGame}
            >
              {isCreating ? 'Starting...' : 'Start Game'}
            </PrimaryButton>
          </>
        ) : (
          <>
            {currentStep > 1 ? (
              <SecondaryButton className="wizard-button wizard-button-secondary" onClick={handleBack}>
                Back
              </SecondaryButton>
            ) : null}
            <PrimaryButton className="wizard-button" disabled={!isStepValid} onClick={handleNext}>
              Next
            </PrimaryButton>
          </>
        )}
      </div>

      <div className="wizard-visually-hidden" aria-hidden="true">
        <img src={getWizardPersona(currentDraft.avatar).asset} alt="" />
        <img src={getWizardCity(currentDraft.cityId).asset} alt="" />
        <img src={getWizardTrack(currentDraft.educationTrackId).asset} alt="" />
      </div>
    </div>
  )
}

export default NewGameWizard
