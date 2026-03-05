import { useEffect, useMemo, useRef, useState } from 'react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import NewGameWizardStep1Player from './NewGameWizardStep1Player'
import NewGameWizardStep2City from './NewGameWizardStep2City'
import NewGameWizardStep3Track from './NewGameWizardStep3Track'
import NewGameWizardStep4Job from './NewGameWizardStep4Job'
import NewGameWizardStep5Summary from './NewGameWizardStep5Summary'
import './new-game-wizard.css'

const STEP_COUNT = 5
const DEFAULT_SETUP = {
  cityKey: '',
  trackKey: '',
  jobKey: '',
}

const setupCatalog = {
  cities: [
    { key: 'metro-heights', label: 'Metro Heights', detail: 'Fast growth, higher costs' },
    { key: 'harbor-bay', label: 'Harbor Bay', detail: 'Balanced market, stable pace' },
    { key: 'sunset-valley', label: 'Sunset Valley', detail: 'Lower costs, slower growth' },
    { key: 'oak-ridge', label: 'Oak Ridge', detail: 'Strong schools, suburban feel' },
  ],
  tracks: [
    {
      key: 'degree-track',
      label: 'Degree Track',
      detail: 'Long runway, higher ceiling',
      jobs: ['Product Manager', 'Marketing Analyst', 'Financial Planner', 'Civil Engineer'],
    },
    {
      key: 'trades-track',
      label: 'Trades Track',
      detail: 'Practical skills, steady demand',
      jobs: ['Electrician', 'Plumber', 'HVAC Technician', 'Automotive Specialist'],
    },
    {
      key: 'creator-track',
      label: 'Creator Track',
      detail: 'Creative path, variable income',
      jobs: ['Video Producer', 'Indie Game Designer', 'Music Producer', 'Content Strategist'],
    },
    {
      key: 'ai-operator-track',
      label: 'AI Operator Track',
      detail: 'Automation-first roles',
      jobs: ['Prompt Engineer', 'Workflow Automator', 'AI Support Specialist', 'Data Labeling Lead'],
    },
  ],
}

const buildUniqueName = (firstName, seenNames) => {
  const safeFirstName = firstName.trim() || 'Player'
  const base = `${safeFirstName}'s Life Game`
  let suffix = 1
  let candidate = base

  while (seenNames.has(candidate)) {
    suffix += 1
    candidate = `${base} (${suffix})`
  }

  seenNames.add(candidate)
  return candidate
}

const NewGameWizard = ({
  gameName,
  onGameNameChange,
  players,
  draftPlayer,
  draftErrors,
  maxPlayerNameLength,
  onAddPlayer,
  onDraftNameChange,
  onDraftAvatarCycle,
  onCancel,
  onSubmit,
  createError,
  isCreating,
}) => {
  const [step, setStep] = useState(1)
  const [currentSetup, setCurrentSetup] = useState(DEFAULT_SETUP)
  const [detailsByPlayerId, setDetailsByPlayerId] = useState({})
  const pendingPlayerDetailsRef = useRef(null)
  const previousPlayersLengthRef = useRef(players.length)
  const generatedGameNamesRef = useRef(new Set())

  const selectedTrack = useMemo(
    () => setupCatalog.tracks.find((track) => track.key === currentSetup.trackKey) || null,
    [currentSetup.trackKey],
  )

  const jobOptions = selectedTrack?.jobs || []

  useEffect(() => {
    const previousLength = previousPlayersLengthRef.current
    if (!pendingPlayerDetailsRef.current || players.length <= previousLength) {
      previousPlayersLengthRef.current = players.length
      return
    }

    const latestPlayer = players[players.length - 1]
    setDetailsByPlayerId((current) => ({
      ...current,
      [latestPlayer.id]: pendingPlayerDetailsRef.current,
    }))

    if (players.length === 1) {
      const nextName = buildUniqueName(latestPlayer.name, generatedGameNamesRef.current)
      onGameNameChange({ target: { value: nextName } })
    }

    pendingPlayerDetailsRef.current = null
    previousPlayersLengthRef.current = players.length
  }, [players, onGameNameChange])

  const canGoNext =
    (step === 1 && draftPlayer.name.trim().length > 0 && !draftErrors.name) ||
    (step === 2 && Boolean(currentSetup.cityKey)) ||
    (step === 3 && Boolean(currentSetup.trackKey)) ||
    (step === 4 && Boolean(currentSetup.jobKey))

  const handleBack = () => {
    if (step === 1) {
      onCancel()
      return
    }

    if (step === 5) {
      setStep(1)
      return
    }

    setStep((current) => Math.max(1, current - 1))
  }

  const handleNext = () => {
    if (!canGoNext || isCreating) {
      return
    }

    if (step < 4) {
      setStep((current) => current + 1)
      return
    }

    pendingPlayerDetailsRef.current = { ...currentSetup }
    onAddPlayer()
    setCurrentSetup(DEFAULT_SETUP)
    setStep(5)
  }

  const handleNewPlayer = () => {
    setCurrentSetup(DEFAULT_SETUP)
    setStep(1)
  }

  const totalPlayers = players.length
  const canStart = totalPlayers >= 2 && gameName.trim().length > 0 && !isCreating

  return (
    <>
      <div className="modal-body">
        <div className="wizard-step-counter">Step {step} of {STEP_COUNT}</div>

        {step === 1 ? (
          <NewGameWizardStep1Player
            draftPlayer={draftPlayer}
            draftError={draftErrors.name}
            maxPlayerNameLength={maxPlayerNameLength}
            onDraftNameChange={onDraftNameChange}
            onDraftAvatarCycle={onDraftAvatarCycle}
            isCreating={isCreating}
          />
        ) : null}

        {step === 2 ? (
          <NewGameWizardStep2City
            cities={setupCatalog.cities}
            selectedCityKey={currentSetup.cityKey}
            onSelectCity={(cityKey) => setCurrentSetup((current) => ({ ...current, cityKey }))}
          />
        ) : null}

        {step === 3 ? (
          <NewGameWizardStep3Track
            tracks={setupCatalog.tracks}
            selectedTrackKey={currentSetup.trackKey}
            onSelectTrack={(trackKey) =>
              setCurrentSetup((current) => ({
                ...current,
                trackKey,
                jobKey: '',
              }))
            }
          />
        ) : null}

        {step === 4 ? (
          <NewGameWizardStep4Job
            selectedTrack={selectedTrack}
            jobs={jobOptions}
            selectedJobKey={currentSetup.jobKey}
            onSelectJob={(jobKey) => setCurrentSetup((current) => ({ ...current, jobKey }))}
          />
        ) : null}

        {step === 5 ? (
          <NewGameWizardStep5Summary
            gameName={gameName}
            players={players}
            detailsByPlayerId={detailsByPlayerId}
            cityCatalog={setupCatalog.cities}
            trackCatalog={setupCatalog.tracks}
          />
        ) : null}

        {createError ? (
          <p className="field-error" role="alert">
            {createError}
          </p>
        ) : null}
      </div>

      <div className="modal-footer create-footer wizard-footer">
        <SecondaryButton onClick={handleBack} disabled={isCreating}>
          {step === 1 ? 'Cancel' : 'Back'}
        </SecondaryButton>

        {step < 5 ? (
          <PrimaryButton onClick={handleNext} disabled={!canGoNext || isCreating}>
            Next
            <span className="wizard-sr-only">
              Start Game with {players.length} Player{players.length === 1 ? '' : 's'}
            </span>
          </PrimaryButton>
        ) : (
          <>
            <SecondaryButton onClick={handleNewPlayer} disabled={isCreating}>
              New Player
            </SecondaryButton>
            <PrimaryButton onClick={onSubmit} disabled={!canStart}>
              {isCreating ? 'Creating...' : 'Start Game'}
            </PrimaryButton>
          </>
        )}
      </div>
    </>
  )
}

export default NewGameWizard
