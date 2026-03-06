import { useMemo, useState } from 'react'
import {
  buildNameCounts,
  createDefaultDraftPlayer,
  createDefaultPlayers,
  getPlayerErrors,
} from '../utils/gameValidation'
import {
  DEFAULT_PLAYER_AVATAR_KEY,
  getNextAvailablePlayerAvatarKey,
  getNextPlayerAvatarKey,
} from '../data/playerAvatars'

const DEFAULT_PLAYER_ID = 1
const DEFAULT_STEP = 1

const createInitialDraft = () => ({
  name: '',
  players: createDefaultPlayers(),
  draftPlayer: createDefaultDraftPlayer(),
  currentStep: DEFAULT_STEP,
})

const useCreateGameForm = () => {
  const [draft, setDraft] = useState(createInitialDraft)
  const [gameNameTouched, setGameNameTouched] = useState(false)
  const [nextPlayerId, setNextPlayerId] = useState(DEFAULT_PLAYER_ID)
  const [draftTouched, setDraftTouched] = useState({ name: false })

  const maxGameNameLength = 60
  const maxPlayerNameLength = 24
  const minPlayers = 2
  const gameName = draft.name
  const players = draft.players
  const draftPlayer = draft.draftPlayer

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
    setDraft((current) => ({
      ...current,
      draftPlayer: {
        ...createDefaultDraftPlayer(),
        avatar: keepAvatar ? current.draftPlayer.avatar : DEFAULT_PLAYER_AVATAR_KEY,
      },
    }))
    setDraftTouched({ name: false })
  }

  const resetForm = () => {
    setDraft(createInitialDraft())
    setGameNameTouched(false)
    setNextPlayerId(DEFAULT_PLAYER_ID)
    setDraftTouched({ name: false })
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
        cityId: draftPlayer.cityId,
        educationTrackId: draftPlayer.educationTrackId,
        jobId: draftPlayer.jobId,
        careerTrack: draftPlayer.careerTrack || '',
      },
    ]
    setDraft((current) => ({
      ...current,
      players: nextPlayers,
      draftPlayer: {
        ...createDefaultDraftPlayer(),
        avatar: getNextAvailablePlayerAvatarKey(
          current.draftPlayer.avatar,
          nextPlayers.map((player) => player.avatar),
        ),
      },
    }))
    setDraftTouched({ name: false })
    setNextPlayerId((current) => current + 1)
    return true
  }

  const removePlayer = (playerId) => {
    setDraft((current) => ({
      ...current,
      players: current.players.filter((player) => player.id !== playerId),
    }))
  }

  const updateDraftName = (value) => {
    setDraft((current) => ({
      ...current,
      draftPlayer: {
        ...current.draftPlayer,
        name: value,
      },
    }))
  }

  const cycleDraftAvatar = () => {
    const unavailableAvatarValues = players.map((player) => player.avatar)
    setDraft((current) => ({
      ...current,
      draftPlayer: {
        ...current.draftPlayer,
        avatar: getNextAvailablePlayerAvatarKey(
          getNextPlayerAvatarKey(current.draftPlayer.avatar),
          unavailableAvatarValues,
        ),
      },
    }))
  }

  const setGameName = (value) => {
    setDraft((current) => ({ ...current, name: value }))
  }

  const updateDraftPlayerField = (field, value) => {
    setDraft((current) => ({
      ...current,
      draftPlayer: {
        ...current.draftPlayer,
        [field]: value,
      },
    }))
  }

  const setCurrentStep = (value) => {
    setDraft((current) => ({ ...current, currentStep: value }))
  }

  return {
    draft,
    currentStep: draft.currentStep,
    setCurrentStep,
    gameName,
    setGameName,
    gameNameTouched,
    setGameNameTouched,
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
    updateDraftPlayerField,
    markDraftTouched,
    cycleDraftAvatar,
  }
}

export default useCreateGameForm
