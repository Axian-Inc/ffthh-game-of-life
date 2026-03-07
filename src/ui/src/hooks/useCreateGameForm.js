import { useMemo, useState } from 'react'
import { buildNameCounts, createDefaultPlayers, getPlayerErrors } from '../utils/gameValidation'
import {
  DEFAULT_PLAYER_AVATAR_KEY,
  getNextAvailablePlayerAvatarKey,
  getNextPlayerAvatarKey,
} from '../data/playerAvatars'

const DEFAULT_PLAYER_ID = 1
const createEmptyDraftPlayer = (avatar = DEFAULT_PLAYER_AVATAR_KEY) => ({
  name: '',
  avatar,
  cityId: '',
  educationTrackId: '',
  jobId: '',
})

const useCreateGameForm = () => {
  const [gameName, setGameName] = useState('')
  const [gameNameTouched, setGameNameTouched] = useState(false)
  const [players, setPlayers] = useState(createDefaultPlayers)
  const [nextPlayerId, setNextPlayerId] = useState(DEFAULT_PLAYER_ID)
  const [draftPlayer, setDraftPlayer] = useState(() => createEmptyDraftPlayer())
  const [draftTouched, setDraftTouched] = useState({ name: false })
  const [currentStep, setCurrentStep] = useState(1)

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
    setDraftPlayer((current) =>
      createEmptyDraftPlayer(keepAvatar ? current.avatar : DEFAULT_PLAYER_AVATAR_KEY),
    )
    setDraftTouched({ name: false })
  }

  const resetForm = () => {
    setGameName('')
    setGameNameTouched(false)
    setPlayers(createDefaultPlayers())
    setNextPlayerId(DEFAULT_PLAYER_ID)
    setCurrentStep(1)
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
    const nextPlayers = [
      ...players,
      {
        id: nextPlayerId,
        name: trimmedName,
        avatar: draftPlayer.avatar,
        cityId: draftPlayer.cityId || '',
        educationTrackId: draftPlayer.educationTrackId || '',
        jobId: draftPlayer.jobId || '',
        careerTrack: draftPlayer.careerTrack || '',
      },
    ]
    setPlayers(nextPlayers)
    setDraftPlayer((current) => ({
      name: '',
      avatar: getNextAvailablePlayerAvatarKey(current.avatar, nextPlayers.map((player) => player.avatar)),
    }))
    setDraftTouched({ name: false })
    setNextPlayerId((current) => current + 1)
    return true
  }

  const removePlayer = (playerId) => {
    setPlayers((current) => current.filter((player) => player.id !== playerId))
  }

  const updateDraftName = (value) => {
    setDraftPlayer((current) => ({ ...current, name: value }))
  }

  const updateDraftField = (field, value) => {
    setDraftPlayer((current) => ({ ...current, [field]: value }))
  }

  const setDraftPlayerData = (nextDraftPlayer) => {
    setDraftPlayer((current) => ({ ...current, ...nextDraftPlayer }))
  }

  const setupDraft = useMemo(
    () => ({
      name: gameName,
      players,
      draftPlayer,
      currentStep,
    }),
    [gameName, players, draftPlayer, currentStep],
  )

  const cycleDraftAvatar = () => {
    const unavailableAvatarValues = players.map((player) => player.avatar)
    setDraftPlayer((current) => ({
      ...current,
      avatar: getNextAvailablePlayerAvatarKey(getNextPlayerAvatarKey(current.avatar), unavailableAvatarValues),
    }))
  }

  return {
    gameName,
    setGameName,
    gameNameTouched,
    setGameNameTouched,
    currentStep,
    setCurrentStep,
    setupDraft,
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
    updateDraftField,
    setDraftPlayerData,
    markDraftTouched,
    cycleDraftAvatar,
  }
}

export default useCreateGameForm
