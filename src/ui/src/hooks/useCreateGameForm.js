import { useMemo, useState } from 'react'
import {
  buildNameCounts,
  createCommittedPlayer,
  createDraftPlayer,
  createSetupDraft,
  getPlayerErrors,
} from '../utils/gameValidation'
import {
  DEFAULT_PLAYER_AVATAR_KEY,
  getNextAvailablePlayerAvatarKey,
  getNextPlayerAvatarKey,
} from '../data/playerAvatars'

const DEFAULT_PLAYER_ID = 1

const useCreateGameForm = () => {
  const [setupDraft, setSetupDraft] = useState(() =>
    createSetupDraft({
      draftPlayer: createDraftPlayer({
        avatar: DEFAULT_PLAYER_AVATAR_KEY,
      }),
    }),
  )
  const [gameNameTouched, setGameNameTouched] = useState(false)
  const [nextPlayerId, setNextPlayerId] = useState(DEFAULT_PLAYER_ID)
  const [draftTouched, setDraftTouched] = useState({ name: false })

  const maxGameNameLength = 60
  const maxPlayerNameLength = 24
  const minPlayers = 2

  const gameName = setupDraft.name
  const players = setupDraft.players
  const draftPlayer = setupDraft.draftPlayer

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
    setSetupDraft((current) => ({
      ...current,
      draftPlayer: createDraftPlayer({
        avatar: keepAvatar ? current.draftPlayer.avatar : DEFAULT_PLAYER_AVATAR_KEY,
      }),
    }))
    setDraftTouched({ name: false })
  }

  const resetForm = () => {
    setSetupDraft(
      createSetupDraft({
        draftPlayer: createDraftPlayer({
          avatar: DEFAULT_PLAYER_AVATAR_KEY,
        }),
      }),
    )
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
      createCommittedPlayer({
        id: nextPlayerId,
        name: trimmedName,
        avatar: draftPlayer.avatar,
        cityId: draftPlayer.cityId,
        educationTrackId: draftPlayer.educationTrackId,
        jobId: draftPlayer.jobId,
      }),
    ]
    setSetupDraft((current) => ({
      ...current,
      players: nextPlayers,
      draftPlayer: createDraftPlayer({
        avatar: getNextAvailablePlayerAvatarKey(
          current.draftPlayer.avatar,
          nextPlayers.map((player) => player.avatar),
        ),
      }),
    }))
    setNextPlayerId((current) => current + 1)
    setDraftTouched({ name: false })
    return true
  }

  const removePlayer = (playerId) => {
    setSetupDraft((current) => ({
      ...current,
      players: current.players.filter((player) => player.id !== playerId),
    }))
  }

  const setGameName = (value) => {
    setSetupDraft((current) => ({
      ...current,
      name: value,
    }))
  }

  const updateDraftName = (value) => {
    setSetupDraft((current) => ({
      ...current,
      draftPlayer: {
        ...current.draftPlayer,
        name: value,
      },
    }))
  }

  const cycleDraftAvatar = () => {
    const unavailableAvatarValues = players.map((player) => player.avatar)
    setSetupDraft((current) => ({
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

  return {
    setupDraft,
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
    markDraftTouched,
    cycleDraftAvatar,
  }
}

export default useCreateGameForm
