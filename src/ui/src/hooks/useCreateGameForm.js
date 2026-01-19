import { useState } from 'react'
import { buildNameCounts, createDefaultPlayers, getPlayerError } from '../utils/gameValidation'

const DEFAULT_PLAYER_ID = 3

const useCreateGameForm = () => {
  const [gameName, setGameName] = useState('')
  const [gameNameTouched, setGameNameTouched] = useState(false)
  const [gameType, setGameType] = useState('classic')
  const [scoringMode, setScoringMode] = useState('standard')
  const [players, setPlayers] = useState(createDefaultPlayers)
  const [nextPlayerId, setNextPlayerId] = useState(DEFAULT_PLAYER_ID)
  const [playerTouched, setPlayerTouched] = useState({})

  const maxGameNameLength = 60
  const maxPlayerNameLength = 24
  const minPlayers = 2

  const trimmedGameName = gameName.trim()
  const isGameNameTooLong = trimmedGameName.length > maxGameNameLength
  const isGameNameValid = trimmedGameName.length > 0 && !isGameNameTooLong

  const nameCounts = buildNameCounts(players)
  const getPlayerValidationError = (player) =>
    getPlayerError({ player, nameCounts, maxPlayerNameLength })
  const arePlayersValid =
    players.length >= minPlayers &&
    players.every((player) => !getPlayerValidationError(player))
  const hasPlayerValidation = Object.values(playerTouched).some(Boolean)

  const avatarOptions = ['🧩', '⚡', '🌿', '🔥', '💫', '🪐', '🧠', '🎯', '🛰️', '🌊']
  const getRandomAvatar = (currentAvatar) => {
    const available = avatarOptions.filter((avatar) => avatar !== currentAvatar)
    return available[Math.floor(Math.random() * available.length)] || avatarOptions[0]
  }

  const resetForm = () => {
    setGameName('')
    setGameNameTouched(false)
    setGameType('classic')
    setScoringMode('standard')
    setPlayers(createDefaultPlayers())
    setNextPlayerId(DEFAULT_PLAYER_ID)
    setPlayerTouched({})
  }

  const markAllTouched = () => {
    setGameNameTouched(true)
    setPlayerTouched((current) => {
      const updated = { ...current }
      players.forEach((player) => {
        updated[player.id] = true
      })
      return updated
    })
  }

  const addPlayer = () => {
    setPlayers((current) => [
      ...current,
      { id: nextPlayerId, name: '', avatar: getRandomAvatar() },
    ])
    setNextPlayerId((current) => current + 1)
  }

  const removePlayer = (playerId) => {
    setPlayers((current) => current.filter((player) => player.id !== playerId))
    setPlayerTouched((current) => {
      if (!current[playerId]) {
        return current
      }
      const { [playerId]: _, ...rest } = current
      return rest
    })
  }

  const updatePlayerName = (playerId, value) => {
    setPlayers((current) =>
      current.map((player) =>
        player.id === playerId ? { ...player, name: value } : player,
      ),
    )
  }

  const markPlayerTouched = (playerId) => {
    setPlayerTouched((current) => ({ ...current, [playerId]: true }))
  }

  const randomizeAvatar = (playerId) => {
    setPlayers((current) =>
      current.map((player) =>
        player.id === playerId
          ? { ...player, avatar: getRandomAvatar(player.avatar) }
          : player,
      ),
    )
  }

  return {
    gameName,
    setGameName,
    gameNameTouched,
    setGameNameTouched,
    gameType,
    setGameType,
    scoringMode,
    setScoringMode,
    players,
    playerTouched,
    maxGameNameLength,
    maxPlayerNameLength,
    minPlayers,
    trimmedGameName,
    isGameNameTooLong,
    isGameNameValid,
    getPlayerValidationError,
    arePlayersValid,
    hasPlayerValidation,
    resetForm,
    markAllTouched,
    addPlayer,
    removePlayer,
    updatePlayerName,
    markPlayerTouched,
    randomizeAvatar,
  }
}

export default useCreateGameForm
