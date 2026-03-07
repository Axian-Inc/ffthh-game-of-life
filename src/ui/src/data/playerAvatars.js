import rocket from 'openmoji/color/svg/1F680.svg'
import robot from 'openmoji/color/svg/1F916.svg'
import cat from 'openmoji/color/svg/1F431.svg'
import octopus from 'openmoji/color/svg/1F419.svg'
import books from 'openmoji/color/svg/1F4DA.svg'
import star from 'openmoji/color/svg/2B50.svg'
import saturn from 'openmoji/color/svg/1FA90.svg'
import tree from 'openmoji/color/svg/1F333.svg'
import blueBook from 'openmoji/color/svg/1F4D4.svg'
import car from 'openmoji/color/svg/1F697.svg'
import spider from 'openmoji/color/svg/1F577.svg'
import sun from 'openmoji/color/svg/2600.svg'
import pineTree from 'openmoji/color/svg/1F332.svg'
import brain from 'openmoji/color/svg/1F9E0.svg'
import alien from 'openmoji/color/svg/1F47D.svg'
import microbe from 'openmoji/color/svg/1F9A0.svg'
import wrench from 'openmoji/color/svg/1F527.svg'
import graduationCap from 'openmoji/color/svg/1F393.svg'
import laptop from 'openmoji/color/svg/1F4BB.svg'
import biceps from 'openmoji/color/svg/1F4AA.svg'
import palette from 'openmoji/color/svg/1F3A8.svg'
import clapperBoard from 'openmoji/color/svg/1F3AC.svg'
import briefcase from 'openmoji/color/svg/1F4BC.svg'
import lightBulb from 'openmoji/color/svg/1F4A1.svg'
import gear from 'openmoji/color/svg/2699.svg'

export const PLAYER_AVATAR_OPTIONS = [
  { key: 'rocket', label: 'Rocket', src: rocket },
  { key: 'robot', label: 'Robot', src: robot },
  { key: 'cat', label: 'Cat', src: cat },
  { key: 'octopus', label: 'Octopus', src: octopus },
  { key: 'books', label: 'Books', src: books },
  { key: 'star', label: 'Star', src: star },
  { key: 'saturn', label: 'Saturn', src: saturn },
  { key: 'tree', label: 'Tree', src: tree },
  { key: 'blue-book', label: 'Blue Book', src: blueBook },
  { key: 'car', label: 'Car', src: car },
  { key: 'spider', label: 'Spider', src: spider },
  { key: 'sun', label: 'Sun', src: sun },
  { key: 'pine-tree', label: 'Pine Tree', src: pineTree },
  { key: 'brain', label: 'Brain', src: brain },
  { key: 'alien', label: 'Alien', src: alien },
  { key: 'microbe', label: 'Microbe', src: microbe },
  { key: 'wrench', label: 'Wrench', src: wrench },
  { key: 'graduation-cap', label: 'Graduation Cap', src: graduationCap },
  { key: 'laptop', label: 'Laptop', src: laptop },
  { key: 'biceps', label: 'Biceps', src: biceps },
  { key: 'palette', label: 'Palette', src: palette },
  { key: 'clapper-board', label: 'Clapper Board', src: clapperBoard },
  { key: 'briefcase', label: 'Briefcase', src: briefcase },
  { key: 'light-bulb', label: 'Light Bulb', src: lightBulb },
  { key: 'gear', label: 'Gear', src: gear },
]

export const DEFAULT_PLAYER_AVATAR_KEY = PLAYER_AVATAR_OPTIONS[0].key

const LEGACY_AVATAR_KEY_MAP = {
  puzzle: 'rocket',
  sparkles: 'star',
  wave: 'saturn',
  fire: 'light-bulb',
  bullseye: 'gear',
  compass: 'blue-book',
  processor: 'robot',
  hive: 'microbe',
  miner: 'wrench',
  palm: 'tree',
  'monkey-face': 'rocket',
  gorilla: 'robot',
  fox: 'cat',
  'cat-face': 'cat',
  lion: 'sun',
  'tiger-face': 'tree',
  'horse-face': 'biceps',
  zebra: 'saturn',
  deer: 'pine-tree',
  'cow-face': 'briefcase',
  'pig-face': 'light-bulb',
  frog: 'alien',
  koala: 'blue-book',
  'rabbit-face': 'star',
  'bear-face': 'gear',
  panda: 'books',
  penguin: 'octopus',
  owl: 'brain',
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
