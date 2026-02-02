import { useMemo, useState } from 'react'
import { buildNameCounts, createDefaultPlayers, getPlayerErrors } from '../utils/gameValidation'

const DEFAULT_PLAYER_ID = 1

const avatarOptions = ['🧩', '⚡', '🌿', '🔥', '💫', '🪐', '🧠', '🎯', '🛰️', '🌊']

const getRandomAvatar = (currentAvatar) => {
  const available = avatarOptions.filter((avatar) => avatar !== currentAvatar)
  return available[Math.floor(Math.random() * available.length)] || avatarOptions[0]
}

const useCreateGameForm = () => {
  const [gameName, setGameName] = useState('')
  const [gameNameTouched, setGameNameTouched] = useState(false)
  const [gameType, setGameType] = useState('classic')
  const [scoringMode, setScoringMode] = useState('standard')
  const [players, setPlayers] = useState(createDefaultPlayers)
  const [nextPlayerId, setNextPlayerId] = useState(DEFAULT_PLAYER_ID)
  const [draftPlayer, setDraftPlayer] = useState({
    name: '',
    avatar: avatarOptions[0],
  })
  const [draftTouched, setDraftTouched] = useState({ name: false })

  const maxGameNameLength = 60
  const maxPlayerNameLength = 24
  const minPlayers = 1

  const trimmedGameName = gameName.trim()
  const isGameNameTooLong = trimmedGameName.length > maxGameNameLength
  const isGameNameValid = trimmedGameName.length > 0 && !isGameNameTooLong

  const playerCounts = useMemo(() => {
    const nameCounts = buildNameCounts(players)
    return { nameCounts }
  }, [players])

  const arePlayersValid =
    players.length >= minPlayers &&
    players.every((player) => {
      const errors = getPlayerErrors({
        player,
        nameCounts: playerCounts.nameCounts,
        maxPlayerNameLength,
      })
      return !errors.name
    })

  const draftCounts = useMemo(() => {
    const draftPool = [...players, draftPlayer]
    return {
      nameCounts: buildNameCounts(draftPool),
    }
  }, [players, draftPlayer])

  const draftErrors = getPlayerErrors({
    player: draftPlayer,
    nameCounts: draftCounts.nameCounts,
    maxPlayerNameLength,
  })
  const isDraftValid = !draftErrors.name

  const resetDraft = (keepAvatar = true) => {
    setDraftPlayer((current) => ({
      name: '',
      avatar: keepAvatar ? current.avatar : getRandomAvatar(current.avatar),
    }))
    setDraftTouched({ name: false })
  }

  const resetForm = () => {
    setGameName('')
    setGameNameTouched(false)
    setGameType('classic')
    setScoringMode('standard')
    setPlayers(createDefaultPlayers())
    setNextPlayerId(DEFAULT_PLAYER_ID)
    resetDraft(false)
  }

  const markAllTouched = () => {
    setGameNameTouched(true)
  }

  const markDraftTouched = (field) => {
    setDraftTouched((current) => ({ ...current, [field]: true }))
  }

  const addPlayer = () => {
    if (!isDraftValid) {
      setDraftTouched({ name: true })
      return false
    }

    const trimmedName = draftPlayer.name.trim()
    setPlayers((current) => [
      ...current,
      {
        id: nextPlayerId,
        name: trimmedName,
        avatar: draftPlayer.avatar,
      },
    ])
    setNextPlayerId((current) => current + 1)
    resetDraft(true)
    return true
  }

  const removePlayer = (playerId) => {
    setPlayers((current) => current.filter((player) => player.id !== playerId))
  }

  const updateDraftName = (value) => {
    setDraftPlayer((current) => ({ ...current, name: value }))
  }

  const randomizeDraftAvatar = () => {
    setDraftPlayer((current) => ({ ...current, avatar: getRandomAvatar(current.avatar) }))
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
    draftPlayer,
    draftTouched,
    draftErrors,
    maxGameNameLength,
    maxPlayerNameLength,
    minPlayers,
    trimmedGameName,
    isGameNameTooLong,
    isGameNameValid,
    arePlayersValid,
    resetForm,
    markAllTouched,
    addPlayer,
    removePlayer,
    updateDraftName,
    markDraftTouched,
    randomizeDraftAvatar,
  }
}

export default useCreateGameForm
