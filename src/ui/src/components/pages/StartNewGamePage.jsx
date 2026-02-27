import { useEffect, useMemo, useState } from 'react'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'
import PlayerAvatar from '../ui/PlayerAvatar'
import degreeTrackIcon from 'openmoji/color/svg/1F393.svg'
import tradesTrackIcon from 'openmoji/color/svg/1F6E0.svg'
import creatorTrackIcon from 'openmoji/color/svg/1F3AC.svg'
import aiOperatorTrackIcon from 'openmoji/color/svg/1F916.svg'

const careerOptions = [
  {
    key: 'degree-track',
    title: 'Degree Track',
    iconSrc: degreeTrackIcon,
    iconLabel: 'Graduation cap',
    start: 'Take $30,000 Student Debt',
    eachTurn: 'Earn your weekly salary',
    bonus: '+$250/week (better roles)',
    cost: '-$150/week until Student Debt is paid',
  },
  {
    key: 'trades-track',
    title: 'Trades Track',
    iconSrc: tradesTrackIcon,
    iconLabel: 'Hammer and wrench',
    start: 'No debt',
    eachTurn: 'Earn your weekly salary',
    bonus: '+$150/week starting now',
    cost: 'When an event says "Injury/Burnout", lose 2 weeks of salary',
  },
  {
    key: 'creator-track',
    title: 'Creator Track',
    iconSrc: creatorTrackIcon,
    iconLabel: 'Clapper board',
    start: 'Unstable income',
    eachTurn: 'Roll a die',
    bonus: 'On 5-6, gain +$1,000 (Breakout)',
    cost: 'On 1-2, earn $0 this turn (Dry spell)',
  },
  {
    key: 'ai-operator-track',
    title: 'AI Operator Track',
    iconSrc: aiOperatorTrackIcon,
    iconLabel: 'Robot face',
    start: 'Tool advantage',
    eachTurn: 'Earn your weekly salary',
    bonus: 'Draw 1 extra Event card and choose 1 to keep',
    cost: 'Pay $400 every 3rd turn (Reskill cost)',
  },
]

const StartNewGamePage = ({ game, onStart, onBack, isStarting = false, startError = '' }) => {
  const [selectedCareersByPlayerId, setSelectedCareersByPlayerId] = useState({})
  const careerOptionByTitle = useMemo(
    () => Object.fromEntries(careerOptions.map((option) => [option.title, option])),
    [],
  )

  useEffect(() => {
    if (!game?.players) {
      setSelectedCareersByPlayerId({})
      return
    }

    const preselected = game.players.reduce((accumulator, player) => {
      const option = player.careerTrack ? careerOptionByTitle[player.careerTrack] : null
      if (option) {
        accumulator[player.id] = option.key
      }
      return accumulator
    }, {})
    setSelectedCareersByPlayerId(preselected)
  }, [game?.id, game?.players, careerOptionByTitle])

  if (!game) {
    return null
  }

  const currentPlayerIndex = game.players.findIndex((player) => !selectedCareersByPlayerId[player.id])
  const activePlayerIndex = currentPlayerIndex === -1 ? game.players.length - 1 : currentPlayerIndex
  const activePlayer = game.players[activePlayerIndex] || null
  const selectedCount = Object.keys(selectedCareersByPlayerId).length
  const allPlayersSelected = selectedCount === game.players.length

  const careerOptionsByKey = useMemo(
    () => Object.fromEntries(careerOptions.map((option) => [option.key, option])),
    [],
  )

  const handleCareerSelect = (optionKey) => {
    if (!activePlayer) {
      return
    }
    setSelectedCareersByPlayerId((current) => ({
      ...current,
      [activePlayer.id]: optionKey,
    }))
  }

  const handleStartClick = () => {
    if (!allPlayersSelected) {
      return
    }
    const nextGame = {
      ...game,
      players: game.players.map((player) => {
        const chosenCareerKey = selectedCareersByPlayerId[player.id]
        const chosenCareer = chosenCareerKey ? careerOptionsByKey[chosenCareerKey] : null
        return {
          ...player,
          careerTrack: chosenCareer?.title || null,
        }
      }),
    }
    onStart(nextGame)
  }

  return (
    <section className="start-game-page">
      <div className="start-game-header">
        <p className="eyebrow">Start New Game</p>
        <h2>Choose a career path</h2>
        <p className="tagline">
          Players choose one by one. {selectedCount} of {game.players.length} players locked in.
        </p>
      </div>
      <div className="player-career-list">
        {game.players.map((player, index) => {
          const selectedCareerKey = selectedCareersByPlayerId[player.id]
          const selectedCareer = selectedCareerKey ? careerOptionsByKey[selectedCareerKey] : null
          const isActiveRow = index === activePlayerIndex && !selectedCareerKey
          const isRowLocked = !isActiveRow
          const statusText = selectedCareer
            ? `Career: ${selectedCareer.title}`
            : isActiveRow
              ? 'Choosing now'
              : 'Waiting for turn'
          return (
            <div className={`player-career-card ${isActiveRow ? 'player-career-card-active' : ''}`} key={player.id}>
              <div className="player-career-title">
                <span className="player-career-avatar" aria-hidden="true">
                  <PlayerAvatar avatar={player.avatar} decorative />
                </span>
                <div>
                  <h3>{player.name || 'Player'}</h3>
                  <p className="player-career-subtitle">{statusText}</p>
                </div>
              </div>
              {isActiveRow ? (
                <div className="career-grid">
                  {careerOptions.map((option) => (
                    <button
                      aria-disabled={isRowLocked}
                      className={`career-card career-card-${option.key} ${
                        selectedCareerKey === option.key ? 'career-card-selected' : ''
                      }`}
                      disabled={isRowLocked || isStarting}
                      key={`${player.id}-${option.title}`}
                      onClick={() => handleCareerSelect(option.key)}
                      type="button"
                    >
                      <div className="career-card-header">
                        <h4>
                          <img
                            alt={option.iconLabel}
                            aria-hidden="true"
                            className="career-track-icon"
                            src={option.iconSrc}
                          />{' '}
                          {option.title}
                        </h4>
                      </div>
                      <ul className="career-choice-lines">
                        <li>
                          <strong>Start:</strong> {option.start}
                        </li>
                        <li>
                          <strong>Each turn:</strong> {option.eachTurn}
                        </li>
                        <li>
                          <strong>Bonus:</strong> {option.bonus}
                        </li>
                        <li>
                          <strong>Cost:</strong> {option.cost}
                        </li>
                      </ul>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="start-game-actions">
        <SecondaryButton onClick={onBack}>Back to home</SecondaryButton>
        <PrimaryButton disabled={!allPlayersSelected || isStarting} onClick={handleStartClick}>
          {isStarting ? 'Saving...' : 'Start Game'}
        </PrimaryButton>
      </div>
      {startError ? (
        <p className="field-error" role="alert">
          {startError}
        </p>
      ) : null}
    </section>
  )
}

export default StartNewGamePage
