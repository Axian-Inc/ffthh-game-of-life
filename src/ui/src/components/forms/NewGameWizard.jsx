import { useEffect, useMemo, useState } from 'react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import { DEFAULT_PLAYER_AVATAR_KEY } from '../../data/playerAvatars'
import { getSetupItemById, setupCatalog } from '../../data/setupCatalog'
import NewGameWizardStep1Player from './NewGameWizardStep1Player'
import NewGameWizardStep2City from './NewGameWizardStep2City'
import NewGameWizardStep3Track from './NewGameWizardStep3Track'
import NewGameWizardStep4Job from './NewGameWizardStep4Job'
import NewGameWizardStep5Summary from './NewGameWizardStep5Summary'
import './new-game-wizard.css'

const STEP_META = {
  1: { title: 'New Player Setup', subtitle: 'Step 1 of 5' },
  2: { title: 'New Player Setup - Pick City', subtitle: 'Step 2 of 5' },
  3: { title: 'New Player Setup - Education Track', subtitle: 'Step 3 of 5' },
  4: { title: 'New Player Setup - Pick a Career', subtitle: 'Step 4 of 5' },
  5: { title: 'New Game - Summary', subtitle: 'Step 5 of 5' },
}

const createDraftPlayer = (localId, avatar = DEFAULT_PLAYER_AVATAR_KEY) => ({
  localId,
  name: '',
  avatar,
  cityId: '',
  educationTrackId: '',
  jobId: '',
})

const isPlayerComplete = (player) =>
  Boolean(player.name.trim() && player.avatar && player.cityId && player.educationTrackId && player.jobId)

const NewGameWizard = ({
  gameName,
  onGameNameChange,
  onSubmit,
  onAddPlayer,
  onDraftNameChange,
  draftPlayer,
  players,
  isCreating,
}) => {
  const initialAvatar = draftPlayer?.avatar || DEFAULT_PLAYER_AVATAR_KEY
  const [nextLocalId, setNextLocalId] = useState(2)
  const [wizardState, setWizardState] = useState({
    currentStep: 1,
    players: [],
    draftPlayer: createDraftPlayer(1, initialAvatar),
  })
  const [pendingSubmitCount, setPendingSubmitCount] = useState(null)
  const [pendingPersist, setPendingPersist] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const cityById = useMemo(
    () => Object.fromEntries(setupCatalog.cities.map((city) => [city.id, city])),
    [],
  )
  const trackById = useMemo(
    () => Object.fromEntries(setupCatalog.educationTracks.map((track) => [track.id, track])),
    [],
  )
  const jobById = useMemo(() => Object.fromEntries(setupCatalog.jobs.map((job) => [job.id, job])), [])

  const currentMeta = STEP_META[wizardState.currentStep]

  const nameIsDuplicate = wizardState.players.some(
    (player) => player.name.trim().toLowerCase() === wizardState.draftPlayer.name.trim().toLowerCase(),
  )
  const step1NameError = !wizardState.draftPlayer.name.trim()
    ? 'Player name is required.'
    : nameIsDuplicate
      ? 'Player name must be unique.'
      : ''

  const jobsForSelectedTrack = setupCatalog.jobs.filter(
    (job) => job.educationTrackId === wizardState.draftPlayer.educationTrackId,
  )

  const summaryPlayers = useMemo(
    () => [...wizardState.players, wizardState.draftPlayer].filter(isPlayerComplete),
    [wizardState.players, wizardState.draftPlayer],
  )

  useEffect(() => {
    if (!gameName?.trim()) {
      onGameNameChange({ target: { value: 'New Game' } })
    }
  }, [gameName, onGameNameChange])

  useEffect(() => {
    if (pendingSubmitCount === null) {
      return
    }
    if (players.length < pendingSubmitCount) {
      return
    }
    onSubmit()
    setPendingSubmitCount(null)
  }, [players.length, pendingSubmitCount, onSubmit])

  useEffect(() => {
    if (!pendingPersist) {
      return
    }
    if ((draftPlayer?.name || '').trim() !== pendingPersist.name) {
      return
    }

    const added = onAddPlayer()
    if (!added) {
      setSubmitError('Unable to save player. Ensure the name is valid and unique.')
      setPendingPersist(null)
      return
    }

    if (pendingPersist.action === 'add-player') {
      setWizardState((current) => ({
        currentStep: 1,
        players: [...current.players, pendingPersist.player],
        draftPlayer: createDraftPlayer(nextLocalId, pendingPersist.player.avatar),
      }))
      setNextLocalId((current) => current + 1)
    } else {
      setPendingSubmitCount(players.length + 1)
    }

    setSubmitError('')
    setPendingPersist(null)
  }, [draftPlayer?.name, nextLocalId, onAddPlayer, pendingPersist, players.length])

  const updateDraftPlayer = (updates) => {
    setWizardState((current) => ({
      ...current,
      draftPlayer: {
        ...current.draftPlayer,
        ...updates,
      },
    }))
  }

  const handleNameChange = (value) => {
    updateDraftPlayer({ name: value })
  }

  const canGoNext =
    (wizardState.currentStep === 1 && !step1NameError && Boolean(wizardState.draftPlayer.avatar)) ||
    (wizardState.currentStep === 2 && Boolean(wizardState.draftPlayer.cityId)) ||
    (wizardState.currentStep === 3 && Boolean(wizardState.draftPlayer.educationTrackId)) ||
    (wizardState.currentStep === 4 && Boolean(wizardState.draftPlayer.jobId))

  const queueDraftPersistence = (action) => {
    const persistedPlayer = { ...wizardState.draftPlayer, name: wizardState.draftPlayer.name.trim() }
    onDraftNameChange({ target: { value: persistedPlayer.name } })
    setPendingPersist({ action, name: persistedPlayer.name, player: persistedPlayer })
  }

  const goToNext = () => {
    if (!canGoNext) {
      return
    }
    setWizardState((current) => ({ ...current, currentStep: Math.min(current.currentStep + 1, 5) }))
  }

  const goToPrevious = () => {
    setWizardState((current) => ({ ...current, currentStep: Math.max(current.currentStep - 1, 1) }))
  }

  const handleAddNewPlayer = () => {
    if (!isPlayerComplete(wizardState.draftPlayer)) {
      return
    }
    queueDraftPersistence('add-player')
  }

  const handleStartGame = () => {
    if (summaryPlayers.length < 2 || !isPlayerComplete(wizardState.draftPlayer)) {
      return
    }

    queueDraftPersistence('start')
  }

  return (
    <div className="wizard-shell">
      <div className="wizard-headings">
        <h2 className="wizard-title" id="new-game-wizard-title">
          {currentMeta.title}
        </h2>
        <p className="wizard-subtitle">{currentMeta.subtitle}</p>
      </div>

      {wizardState.currentStep === 1 ? (
        <NewGameWizardStep1Player
          draftPlayer={wizardState.draftPlayer}
          onNameChange={handleNameChange}
          onAvatarSelect={(avatarKey) => updateDraftPlayer({ avatar: avatarKey })}
          isCreating={isCreating}
          nameError={step1NameError}
        />
      ) : null}

      {wizardState.currentStep === 2 ? (
        <NewGameWizardStep2City
          cities={setupCatalog.cities}
          selectedCityId={wizardState.draftPlayer.cityId}
          onSelectCity={(cityId) => updateDraftPlayer({ cityId })}
          isCreating={isCreating}
        />
      ) : null}

      {wizardState.currentStep === 3 ? (
        <NewGameWizardStep3Track
          tracks={setupCatalog.educationTracks}
          selectedTrackId={wizardState.draftPlayer.educationTrackId}
          onSelectTrack={(educationTrackId) => updateDraftPlayer({ educationTrackId, jobId: '' })}
          isCreating={isCreating}
        />
      ) : null}

      {wizardState.currentStep === 4 ? (
        <NewGameWizardStep4Job
          jobs={jobsForSelectedTrack}
          selectedJobId={wizardState.draftPlayer.jobId}
          onSelectJob={(jobId) => updateDraftPlayer({ jobId })}
          isCreating={isCreating}
        />
      ) : null}

      {wizardState.currentStep === 5 ? (
        <NewGameWizardStep5Summary
          summaryPlayers={summaryPlayers}
          cityById={cityById}
          trackById={trackById}
          jobById={jobById}
        />
      ) : null}

      {submitError ? (
        <p className="wizard-error" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="wizard-footer">
        {wizardState.currentStep > 1 ? (
          <SecondaryButton onClick={goToPrevious} disabled={isCreating}>
            Back
          </SecondaryButton>
        ) : (
          <span className="wizard-footer-placeholder" aria-hidden="true" />
        )}

        {wizardState.currentStep < 5 ? (
          <PrimaryButton onClick={goToNext} disabled={!canGoNext || isCreating || Boolean(pendingPersist)}>
            Next
          </PrimaryButton>
        ) : (
          <div className="wizard-summary-actions">
            <SecondaryButton
              onClick={handleAddNewPlayer}
              disabled={isCreating || !isPlayerComplete(wizardState.draftPlayer) || Boolean(pendingPersist)}
            >
              + New Player
            </SecondaryButton>
            <PrimaryButton
              onClick={handleStartGame}
              disabled={isCreating || summaryPlayers.length < 2 || Boolean(pendingPersist)}
            >
              Start Game
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewGameWizard
