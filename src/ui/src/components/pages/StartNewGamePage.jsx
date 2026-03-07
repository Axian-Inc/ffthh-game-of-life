import { useMemo } from 'react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import { getGameNameError } from '../../utils/gameValidation'
import degreeTrackIcon from 'openmoji/color/svg/1F393.svg'
import tradesTrackIcon from 'openmoji/color/svg/1F6E0.svg'
import streetSmartTrackIcon from 'openmoji/color/svg/1F3AC.svg'

const cityOptions = [
  {
    id: 'denver-co',
    label: 'Denver, CO',
    detail: 'Balanced costs, strong growth, and enough breathing room for a fresh start.',
  },
  {
    id: 'portland-or',
    label: 'Portland, OR',
    detail: 'Creative energy, higher daily expenses, and plenty of lifestyle choices.',
  },
  {
    id: 'tonopah-nv',
    label: 'Tonopah, NV',
    detail: 'Lower costs and fewer distractions, with slower career momentum.',
  },
]

const educationTrackOptions = [
  {
    id: 'degree-track',
    title: 'Degree Track',
    iconSrc: degreeTrackIcon,
    iconLabel: 'Graduation cap',
    detail: 'Bigger upside later, but more debt pressure early.',
  },
  {
    id: 'trades-track',
    title: 'Trades Track',
    iconSrc: tradesTrackIcon,
    iconLabel: 'Hammer and wrench',
    detail: 'Lower debt and fast income with steady hands-on work.',
  },
  {
    id: 'street-smart',
    title: 'Street Smart',
    iconSrc: streetSmartTrackIcon,
    iconLabel: 'Clapper board',
    detail: 'Flexible, independent, and shaped by hustle instead of school.',
  },
]

const jobOptions = [
  {
    id: 'veterinarian',
    title: 'Veterinarian',
    careerTrack: 'Health & Science',
    income: '$1,850/month',
    detail: 'High skill, long-term upside, and dependable demand.',
  },
  {
    id: 'electrician',
    title: 'Electrician',
    careerTrack: 'Skilled Trades',
    income: '$1,650/month',
    detail: 'Reliable income, practical work, and solid growth without college debt.',
  },
  {
    id: 'restaurateur',
    title: 'Restaurateur',
    careerTrack: 'Community Builder',
    income: '$1,500/month',
    detail: 'People-first work with upside tied to hustle, reputation, and consistency.',
  },
]

const stepContent = {
  1: { title: 'New Game Setup', subtitle: 'Step 1 of 6' },
  2: { title: 'New Player Setup', subtitle: 'Step 2 of 6' },
  3: { title: 'New Player Setup - Pick City', subtitle: 'Step 3 of 6' },
  4: { title: 'New Player Setup - Education Track', subtitle: 'Step 4 of 6' },
  5: { title: 'New Player Setup - Pick a Career', subtitle: 'Step 5 of 6' },
  6: { title: 'New Game - Summary', subtitle: 'Step 6 of 6' },
}

const StartNewGamePage = ({
  draft,
  currentStep,
  minPlayers,
  maxGameNameLength,
  maxPlayerNameLength,
  gameNameTouched,
  isGameNameValid,
  isGameNameTooLong,
  arePlayersValid,
  isDraftIdentityValid,
  isDraftPlayerConfigured,
  onGameNameChange,
  onGameNameBlur,
  onDraftNameChange,
  onDraftFieldChange,
  onDraftAvatarCycle,
  onDraftBlur,
  onNextStep,
  onPreviousStep,
  onAddPlayer,
  onRemovePlayer,
  onStartNewPlayer,
  onStart,
  onBack,
  isStarting = false,
  startError = '',
}) => {
  const cityById = useMemo(() => Object.fromEntries(cityOptions.map((option) => [option.id, option])), [])
  const educationTrackById = useMemo(
    () => Object.fromEntries(educationTrackOptions.map((option) => [option.id, option])),
    [],
  )
  const jobById = useMemo(() => Object.fromEntries(jobOptions.map((option) => [option.id, option])), [])

  const currentPlayerNumber = draft.players.length + 1
  const currentStepCopy = stepContent[currentStep] || stepContent[1]
  const gameNameError = getGameNameError({
    isValid: isGameNameValid,
    isTooLong: isGameNameTooLong,
    maxLength: maxGameNameLength,
  })
  const showGameNameError = gameNameTouched && gameNameError
  const showDraftNameError = draft.draftPlayer.name.length > 0 || currentStep > 2
  const canMoveFromStep3 = Boolean(draft.draftPlayer.cityId)
  const canMoveFromStep4 = Boolean(draft.draftPlayer.educationTrackId)
  const canMoveFromStep5 = Boolean(isDraftPlayerConfigured)
  const canStartGame = isGameNameValid && arePlayersValid

  const handleNext = () => {
    if (currentStep === 1) {
      onGameNameBlur()
      if (!isGameNameValid) {
        return
      }
      onNextStep()
      return
    }

    if (currentStep === 2) {
      onDraftBlur('name')
      if (!isDraftIdentityValid) {
        return
      }
      onNextStep()
      return
    }

    if (currentStep === 3) {
      onDraftBlur('cityId')
      if (!canMoveFromStep3) {
        return
      }
      onNextStep()
      return
    }

    if (currentStep === 4) {
      onDraftBlur('educationTrackId')
      if (!canMoveFromStep4) {
        return
      }
      onNextStep()
    }
  }

  const handleAddPlayer = () => {
    onDraftBlur('name')
    onDraftBlur('cityId')
    onDraftBlur('educationTrackId')
    onDraftBlur('jobId')
    const selectedJob = jobById[draft.draftPlayer.jobId]
    onAddPlayer({
      careerTrack: selectedJob?.careerTrack || draft.draftPlayer.educationTrackId,
    })
  }

  return (
    <section className="start-game-page">
      <div className="setup-shell">
        <div className="start-game-header">
          <p className="eyebrow">{currentStepCopy.title}</p>
          <h2>{currentStepCopy.title}</h2>
          <p className="tagline">{currentStepCopy.subtitle}</p>
          {currentStep > 1 && currentStep < 6 ? (
            <p className="setup-helper">Configuring Player {currentPlayerNumber}</p>
          ) : null}
        </div>

        {currentStep === 1 ? (
          <div className="setup-panel">
            <label className="field" htmlFor="setup-game-name">
              <span>Game Name:</span>
              <input
                id="setup-game-name"
                type="text"
                value={draft.name}
                maxLength={maxGameNameLength}
                onChange={(event) => onGameNameChange(event.target.value)}
                onBlur={onGameNameBlur}
                placeholder="Family Game Night"
                aria-invalid={Boolean(showGameNameError)}
              />
            </label>
            {showGameNameError ? <p className="field-error">{gameNameError}</p> : null}
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="setup-panel">
            <div className="wizard-section">
              <label className="field" htmlFor="player-name">
                <span>Player Name:</span>
                <input
                  id="player-name"
                  type="text"
                  value={draft.draftPlayer.name}
                  maxLength={maxPlayerNameLength}
                  onChange={(event) => onDraftNameChange(event.target.value)}
                  onBlur={() => onDraftBlur('name')}
                  placeholder="Player nickname"
                  aria-invalid={Boolean(showDraftNameError && !isDraftIdentityValid)}
                />
              </label>
              {showDraftNameError && !isDraftIdentityValid ? (
                <p className="field-error">Player names must be present, short, and unique.</p>
              ) : null}
            </div>
            <div className="wizard-section">
              <span className="field-label">Choose Your Digital Persona:</span>
              <button className="avatar-choice-card" type="button" onClick={onDraftAvatarCycle}>
                <span className="avatar-choice-preview" aria-hidden="true">
                  <PlayerAvatar avatar={draft.draftPlayer.avatar} decorative />
                </span>
                <span>Click to cycle avatar</span>
              </button>
            </div>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="setup-panel option-grid">
            {cityOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-label={option.label}
                className={`option-card ${draft.draftPlayer.cityId === option.id ? 'option-card-selected' : ''}`}
                onClick={() => onDraftFieldChange('cityId', option.id)}
              >
                <span className="option-card-title">{option.label}</span>
                <span className="option-card-detail">{option.detail}</span>
              </button>
            ))}
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="setup-panel option-grid">
            {educationTrackOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-label={option.title}
                className={`option-card ${draft.draftPlayer.educationTrackId === option.id ? 'option-card-selected' : ''}`}
                onClick={() => onDraftFieldChange('educationTrackId', option.id)}
              >
                <span className="option-card-icon" aria-hidden="true">
                  <img alt={option.iconLabel} src={option.iconSrc} />
                </span>
                <span className="option-card-title">{option.title}</span>
                <span className="option-card-detail">{option.detail}</span>
              </button>
            ))}
          </div>
        ) : null}

        {currentStep === 5 ? (
          <div className="setup-panel option-grid">
            {jobOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-label={option.title}
                className={`option-card ${draft.draftPlayer.jobId === option.id ? 'option-card-selected' : ''}`}
                onClick={() => onDraftFieldChange('jobId', option.id)}
              >
                <span className="option-card-title">{option.title}</span>
                <span className="option-card-meta">{option.careerTrack}</span>
                <span className="option-card-detail">{option.detail}</span>
                <span className="option-card-income">Income: {option.income}</span>
              </button>
            ))}
          </div>
        ) : null}

        {currentStep === 6 ? (
          <div className="setup-panel summary-panel">
            <label className="field summary-name-field" htmlFor="summary-game-name">
              <span>Game Name:</span>
              <input
                id="summary-game-name"
                type="text"
                value={draft.name}
                maxLength={maxGameNameLength}
                onChange={(event) => onGameNameChange(event.target.value)}
                onBlur={onGameNameBlur}
                aria-invalid={Boolean(showGameNameError)}
              />
            </label>
            {showGameNameError ? <p className="field-error">{gameNameError}</p> : null}
            <div className="summary-sheet" role="table" aria-label="Configured players">
              {draft.players.map((player) => (
                <div className="summary-row" key={player.id} role="row">
                  <div className="summary-player">
                    <span className="summary-avatar" aria-hidden="true">
                      <PlayerAvatar avatar={player.avatar} decorative />
                    </span>
                    <div>
                      <p className="summary-primary">{player.name}</p>
                      <p className="summary-secondary">{cityById[player.cityId]?.label || player.cityId}</p>
                    </div>
                  </div>
                  <div className="summary-detail-group">
                    <p className="summary-label">Education:</p>
                    <p className="summary-value">
                      {educationTrackById[player.educationTrackId]?.title || player.educationTrackId}
                    </p>
                  </div>
                  <div className="summary-detail-group">
                    <p className="summary-label">Job:</p>
                    <p className="summary-value">{jobById[player.jobId]?.title || player.jobId}</p>
                  </div>
                  <div className="summary-detail-group">
                    <p className="summary-label">Career:</p>
                    <p className="summary-value">{player.careerTrack}</p>
                  </div>
                  <button
                    className="summary-remove"
                    type="button"
                    onClick={() => onRemovePlayer(player.id)}
                    aria-label={`Remove ${player.name}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {draft.players.length < minPlayers ? (
              <p className="field-error">Add at least {minPlayers} players before starting the game.</p>
            ) : null}
            {startError ? (
              <p className="field-error" role="alert">
                {startError}
              </p>
            ) : null}
          </div>
        ) : null}

        {currentStep < 6 ? (
          <div className="start-game-actions">
            <SecondaryButton onClick={currentStep === 1 ? onBack : onPreviousStep}>Back</SecondaryButton>
            {currentStep < 5 ? (
              <PrimaryButton
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !isGameNameValid) ||
                  (currentStep === 2 && !isDraftIdentityValid) ||
                  (currentStep === 3 && !canMoveFromStep3) ||
                  (currentStep === 4 && !canMoveFromStep4)
                }
              >
                Next
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={handleAddPlayer} disabled={!canMoveFromStep5}>
                Review Summary
              </PrimaryButton>
            )}
          </div>
        ) : (
          <div className="start-game-actions">
            <SecondaryButton onClick={onBack}>Back to home</SecondaryButton>
            <SecondaryButton onClick={onStartNewPlayer}>+ New Player</SecondaryButton>
            <PrimaryButton disabled={!canStartGame || isStarting} onClick={onStart}>
              {isStarting ? 'Saving...' : 'Start Game'}
            </PrimaryButton>
          </div>
        )}
      </div>
    </section>
  )
}

export default StartNewGamePage
