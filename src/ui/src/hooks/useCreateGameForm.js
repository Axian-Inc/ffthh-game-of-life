import { useMemo, useState } from 'react'
import { buildNameCounts, createDefaultPlayers, getPlayerErrors, isConfiguredPlayerValid } from '../utils/gameValidation'
import {
  DEFAULT_PLAYER_AVATAR_KEY,
  getNextAvailablePlayerAvatarKey,
  getNextPlayerAvatarKey,
} from '../data/playerAvatars'

const DEFAULT_PLAYER_ID = 1
const FIRST_STEP = 1
const LAST_STEP = 6

const createEmptyDraftPlayer = (avatar = DEFAULT_PLAYER_AVATAR_KEY) => ({
  name: '',
  avatar,
  cityId: '',
  educationTrackId: '',
  jobId: '',
})

const createInitialDraft = () => ({
  name: '',
  players: createDefaultPlayers(),
  draftPlayer: createEmptyDraftPlayer(),
  currentStep: FIRST_STEP,
})

const clampStep = (step) => Math.min(Math.max(step, FIRST_STEP), LAST_STEP)

const useCreateGameForm = () => {
  const [draft, setDraft] = useState(createInitialDraft)
  const [gameNameTouched, setGameNameTouched] = useState(false)
  const [nextPlayerId, setNextPlayerId] = useState(DEFAULT_PLAYER_ID)
  const [draftTouched, setDraftTouched] = useState({
    name: false,
    cityId: false,
    educationTrackId: false,
    jobId: false,
  })

  const maxGameNameLength = 60
  const maxPlayerNameLength = 24
  const minPlayers = 2

  const gameName = draft.name
  const players = draft.players
  const draftPlayer = draft.draftPlayer
  const currentStep = draft.currentStep

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
      return !errors.name && isConfiguredPlayerValid(player, { maxPlayerNameLength })
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

  const isDraftIdentityValid = !draftErrors.name
  const isDraftPlayerConfigured = Boolean(
    isDraftIdentityValid &&
      draftPlayer.cityId &&
      draftPlayer.educationTrackId &&
      draftPlayer.jobId,
  )

  const resetDraft = (keepAvatar = true) => {
    setDraft((current) => ({
      ...current,
      draftPlayer: createEmptyDraftPlayer(
        keepAvatar ? current.draftPlayer.avatar : DEFAULT_PLAYER_AVATAR_KEY,
      ),
    }))
    setDraftTouched({
      name: false,
      cityId: false,
      educationTrackId: false,
      jobId: false,
    })
  }

  const resetForm = () => {
    setDraft(createInitialDraft())
    setGameNameTouched(false)
    setNextPlayerId(DEFAULT_PLAYER_ID)
    setDraftTouched({
      name: false,
      cityId: false,
      educationTrackId: false,
      jobId: false,
    })
  }

  const markAllTouched = () => {
    setGameNameTouched(true)
    setDraftTouched({
      name: true,
      cityId: true,
      educationTrackId: true,
      jobId: true,
    })
  }

  const markDraftTouched = (field) => {
    setDraftTouched((current) => ({ ...current, [field]: true }))
  }

  const setGameName = (value) => {
    setDraft((current) => ({ ...current, name: value }))
  }

  const setCurrentStep = (step) => {
    setDraft((current) => ({ ...current, currentStep: clampStep(step) }))
  }

  const goToNextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1)
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
      draftPlayer: { ...current.draftPlayer, name: value },
    }))
  }

  const updateDraftPlayerField = (field, value) => {
    setDraft((current) => ({
      ...current,
      draftPlayer: { ...current.draftPlayer, [field]: value },
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

  const addPlayer = ({ careerTrack }) => {
    if (!isDraftPlayerConfigured) {
      setDraftTouched({
        name: true,
        cityId: true,
        educationTrackId: true,
        jobId: true,
      })
      return false
    }

    const trimmedName = draftPlayer.name.trim()
    const nextPlayers = [
      ...players,
      {
        id: `player-${nextPlayerId}`,
        name: trimmedName,
        avatar: draftPlayer.avatar,
        cityId: draftPlayer.cityId,
        educationTrackId: draftPlayer.educationTrackId,
        jobId: draftPlayer.jobId,
        careerTrack,
      },
    ]

    setDraft((current) => ({
      ...current,
      players: nextPlayers,
      draftPlayer: createEmptyDraftPlayer(
        getNextAvailablePlayerAvatarKey(
          current.draftPlayer.avatar,
          nextPlayers.map((player) => player.avatar),
        ),
      ),
      currentStep: LAST_STEP,
    }))
    setDraftTouched({
      name: false,
      cityId: false,
      educationTrackId: false,
      jobId: false,
    })
    setNextPlayerId((value) => value + 1)
    return true
  }

  const startNewPlayer = () => {
    resetDraft(true)
    setCurrentStep(2)
  }

  return {
    draft,
    currentStep,
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
    isDraftIdentityValid,
    isDraftPlayerConfigured,
    resetForm,
    markAllTouched,
    addPlayer,
    removePlayer,
    updateDraftName,
    updateDraftPlayerField,
    markDraftTouched,
    cycleDraftAvatar,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    startNewPlayer,
  }
}

export default useCreateGameForm
