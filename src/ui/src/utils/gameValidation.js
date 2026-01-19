export const createDefaultPlayers = () => [
  { id: 1, name: 'Player 1', avatar: '🧩' },
  { id: 2, name: 'Player 2', avatar: '⚡' },
]

export const buildNameCounts = (players) => {
  const counts = {}

  players.forEach((player) => {
    const name = player.name.trim().toLowerCase()
    if (!name) {
      return
    }
    counts[name] = (counts[name] || 0) + 1
  })

  return counts
}

export const getPlayerError = ({ player, nameCounts, maxPlayerNameLength }) => {
  const trimmedName = player.name.trim()
  if (!trimmedName) {
    return 'Player name is required.'
  }
  if (trimmedName.length > maxPlayerNameLength) {
    return `Name must be ${maxPlayerNameLength} characters or fewer.`
  }
  if (nameCounts[trimmedName.toLowerCase()] > 1) {
    return 'Names must be unique.'
  }
  return ''
}

export const getGameNameError = ({ isValid, isTooLong, maxLength }) => {
  if (isValid) {
    return ''
  }
  if (isTooLong) {
    return `Name must be ${maxLength} characters or fewer.`
  }
  return 'Game name is required.'
}
