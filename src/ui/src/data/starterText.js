export const GAME_NAME_STARTERS = [
  'Family Game Night',
  'Choices & Chill',
  'Weekend Chaos League',
  'The Lucky Turn Club',
  'Snacks and Setbacks',
  'Dream Job Derby',
  'Couch Kingdom Campaign',
  'The Plot Twist Society',
  'Bills, Thrills, and Skills',
  'Glow-Up Game Night',
]

export const PLAYER_NAME_STARTERS = [
  'Avery',
  'Nova',
  'Sunny',
  'Milo',
  'Zuri',
  'Juno',
  'Theo',
  'Piper',
  'Remy',
  'Indy',
  'Cleo',
  'Atlas',
  'Niko',
  'Sage',
  'Lulu',
  'Bodie',
]

const getRandomIndex = (items) => Math.floor(Math.random() * items.length)

export const getRandomGameName = () => GAME_NAME_STARTERS[getRandomIndex(GAME_NAME_STARTERS)]

export const getRandomPlayerName = (takenNames = []) => {
  const normalizedTaken = new Set(
    takenNames
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean),
  )

  const availableNames = PLAYER_NAME_STARTERS.filter((name) => !normalizedTaken.has(name.toLowerCase()))
  const baseName = (availableNames.length > 0 ? availableNames : PLAYER_NAME_STARTERS)[getRandomIndex(
    availableNames.length > 0 ? availableNames : PLAYER_NAME_STARTERS,
  )]

  if (!normalizedTaken.has(baseName.toLowerCase())) {
    return baseName
  }

  let suffix = 2
  let candidate = `${baseName} ${suffix}`
  while (normalizedTaken.has(candidate.toLowerCase())) {
    suffix += 1
    candidate = `${baseName} ${suffix}`
  }
  return candidate
}
