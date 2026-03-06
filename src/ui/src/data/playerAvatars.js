import rocket from 'openmoji/color/svg/1F680.svg'
import robot from 'openmoji/color/svg/1F916.svg'
import cat from 'openmoji/color/svg/1F431.svg'
import octopus from 'openmoji/color/svg/1F419.svg'
import books from 'openmoji/color/svg/1F4DA.svg'
import star from 'openmoji/color/svg/2B50.svg'
import ringedPlanet from 'openmoji/color/svg/1FA90.svg'
import brain from 'openmoji/color/svg/1F9E0.svg'
import tree from 'openmoji/color/svg/1F333.svg'
import book from 'openmoji/color/svg/1F4D5.svg'
import spider from 'openmoji/color/svg/1F577.svg'
import sun from 'openmoji/color/svg/2600.svg'
import car from 'openmoji/color/svg/1F699.svg'
import snake from 'openmoji/color/svg/1F40D.svg'
import turtle from 'openmoji/color/svg/1F422.svg'
import alien from 'openmoji/color/svg/1F47D.svg'
import microbe from 'openmoji/color/svg/1F9A0.svg'
import crab from 'openmoji/color/svg/1F980.svg'
import crocodile from 'openmoji/color/svg/1F40A.svg'
import dolphin from 'openmoji/color/svg/1F42C.svg'
import dragon from 'openmoji/color/svg/1F409.svg'
import dragonFace from 'openmoji/color/svg/1F432.svg'
import jellyfish from 'openmoji/color/svg/1FABC.svg'
import lizard from 'openmoji/color/svg/1F98E.svg'
import lobster from 'openmoji/color/svg/1F99E.svg'

export const PLAYER_AVATAR_OPTIONS = [
  { key: 'rocket', label: 'Rocket', src: rocket },
  { key: 'robot', label: 'Robot', src: robot },
  { key: 'cat', label: 'Cat', src: cat },
  { key: 'octopus', label: 'Octopus', src: octopus },
  { key: 'books', label: 'Books', src: books },
  { key: 'star', label: 'Star', src: star },
  { key: 'ringed-planet', label: 'Ringed Planet', src: ringedPlanet },
  { key: 'brain', label: 'Brain', src: brain },
  { key: 'tree', label: 'Tree', src: tree },
  { key: 'book', label: 'Book', src: book },
  { key: 'spider', label: 'Spider', src: spider },
  { key: 'sun', label: 'Sun', src: sun },
  { key: 'car', label: 'Car', src: car },
  { key: 'snake', label: 'Snake', src: snake },
  { key: 'turtle', label: 'Turtle', src: turtle },
  { key: 'alien', label: 'Alien', src: alien },
  { key: 'microbe', label: 'Microbe', src: microbe },
  { key: 'crab', label: 'Crab', src: crab },
  { key: 'crocodile', label: 'Crocodile', src: crocodile },
  { key: 'dolphin', label: 'Dolphin', src: dolphin },
  { key: 'dragon', label: 'Dragon', src: dragon },
  { key: 'dragon-face', label: 'Dragon Face', src: dragonFace },
  { key: 'jellyfish', label: 'Jellyfish', src: jellyfish },
  { key: 'lizard', label: 'Lizard', src: lizard },
  { key: 'lobster', label: 'Lobster', src: lobster },
]

export const DEFAULT_PLAYER_AVATAR_KEY = PLAYER_AVATAR_OPTIONS[0].key

const LEGACY_AVATAR_KEY_MAP = {
  puzzle: 'octopus',
  sparkles: 'star',
  wave: 'dolphin',
  fire: 'dragon',
  bullseye: 'ringed-planet',
  compass: 'turtle',
  processor: 'robot',
  hive: 'microbe',
  miner: 'crab',
  palm: 'tree',
  'monkey-face': 'rocket',
  gorilla: 'dragon',
  fox: 'cat',
  'cat-face': 'cat',
  lion: 'dragon-face',
  'tiger-face': 'lizard',
  'horse-face': 'dolphin',
  zebra: 'car',
  deer: 'tree',
  'cow-face': 'books',
  'pig-face': 'brain',
  frog: 'crocodile',
  koala: 'turtle',
  'rabbit-face': 'jellyfish',
  'bear-face': 'lobster',
  panda: 'book',
  penguin: 'dolphin',
  owl: 'robot',
  'dog-face': 'star',
}

export const getPlayerAvatarOption = (avatarValue) => {
  if (!avatarValue) {
    return null
  }

  const directMatch = PLAYER_AVATAR_OPTIONS.find((option) => option.key === avatarValue)
  if (directMatch) {
    return directMatch
  }

  const mappedKey = LEGACY_AVATAR_KEY_MAP[avatarValue]
  if (!mappedKey) {
    return null
  }

  return PLAYER_AVATAR_OPTIONS.find((option) => option.key === mappedKey) || null
}

export const getNextPlayerAvatarKey = (avatarValue) => {
  const currentOption = getPlayerAvatarOption(avatarValue)
  const currentIndex = currentOption
    ? PLAYER_AVATAR_OPTIONS.findIndex((option) => option.key === currentOption.key)
    : -1
  const nextIndex = (currentIndex + 1) % PLAYER_AVATAR_OPTIONS.length
  return PLAYER_AVATAR_OPTIONS[nextIndex].key
}

export const getNextAvailablePlayerAvatarKey = (avatarValue, unavailableAvatarValues = []) => {
  const blockedKeys = new Set(
    unavailableAvatarValues
      .map((value) => getPlayerAvatarOption(value)?.key || null)
      .filter(Boolean),
  )
  const currentKey = getPlayerAvatarOption(avatarValue)?.key || DEFAULT_PLAYER_AVATAR_KEY
  const startIndex = PLAYER_AVATAR_OPTIONS.findIndex((option) => option.key === currentKey)

  for (let step = 1; step <= PLAYER_AVATAR_OPTIONS.length; step += 1) {
    const candidate = PLAYER_AVATAR_OPTIONS[(startIndex + step) % PLAYER_AVATAR_OPTIONS.length]
    if (!blockedKeys.has(candidate.key)) {
      return candidate.key
    }
  }

  return currentKey
}
