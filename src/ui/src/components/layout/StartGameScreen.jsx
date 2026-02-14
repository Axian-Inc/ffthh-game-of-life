import { useEffect, useMemo, useState } from 'react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

const careerOptions = [
  { value: 'college', label: 'College' },
  { value: 'trades', label: 'Trades' },
]

const StartGameScreen = ({ game, onStart, onBack, isStarting = false, error = '' }) => {
  const initialSelections = useMemo(() => {
    if (!game) {
      return {}
    }
    return game.players.reduce((acc, player) => {
      acc[player.id || player.name] = ''
      return acc
    }, {})
  }, [game])

  const [selections, setSelections] = useState(initialSelections)

  useEffect(() => {
    setSelections(initialSelections)
  }, [initialSelections])

  if (!game) {
    return null
  }

const handleSelect = (playerKey, value) => {
  setSelections((current) => ({
    ...current,
    [playerKey]: current[playerKey] === value ? '' : value,
  }))
}

  const allSelected = game.players.every((player) => {
    const key = player.id || player.name
    return selections[key]
  })
  const canStart = allSelected && !isStarting

  return (
    <section className="start-game" data-test-id="start-game-screen">
      <div className="start-game-header">
        <div>
          <p className="eyebrow">Start New Game</p>
          <h2 className="start-game-title">{game.name}</h2>
          <p className="tagline">Each player must choose a career path before you begin.</p>
        </div>
        <SecondaryButton onClick={onBack} data-test-id="start-game-back">
          Back to home
        </SecondaryButton>
      </div>
      <div className="start-game-panel">
        <div className="start-game-body">
          {game.players.map((player) => {
            const key = player.id || player.name
            return (
              <div className="career-row" key={key}>
                <div className="career-player">
                  <span className="career-avatar" aria-hidden="true">
                    {player.avatar || '★'}
                  </span>
                  <div>
                    <div className="career-name">{player.name}</div>
                    <div className="career-hint">Select a path for this player.</div>
                  </div>
                </div>
                <div
                  className="career-options"
                  role="radiogroup"
                  aria-label={`Career options for ${player.name}`}
                >
                  {careerOptions.map((option) => {
                    const isSelected = selections[key] === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`career-option ${isSelected ? 'selected' : ''}`.trim()}
                        onClick={() => handleSelect(key, option.value)}
                        aria-pressed={isSelected}
                        data-test-id="career-option"
                        data-career={option.value}
                      >
                        {option.label}
                        {isSelected ? <span className="sr-only"> selected</span> : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div className="start-game-footer">
          <PrimaryButton
            onClick={() => onStart(selections)}
            disabled={!canStart}
            data-test-id="start-game-continue"
          >
            {isStarting ? 'Saving...' : 'Start Game'}
          </PrimaryButton>
          {!allSelected ? (
            <p className="footer-hint">Select a career for every player to continue.</p>
          ) : null}
          {error ? (
            <p className="field-error" role="alert" aria-live="assertive">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default StartGameScreen
