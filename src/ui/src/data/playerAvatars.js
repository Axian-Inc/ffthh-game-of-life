import bear from 'openmoji/color/svg/1F43B.svg'
import bee from 'openmoji/color/svg/1F41D.svg'
import butterfly from 'openmoji/color/svg/1F98B.svg'
import cat from 'openmoji/color/svg/1F431.svg'
import crocodile from 'openmoji/color/svg/1F40A.svg'
import dolphin from 'openmoji/color/svg/1F42C.svg'
import flamingo from 'openmoji/color/svg/1F9A9.svg'
import fox from 'openmoji/color/svg/1F98A.svg'
import frog from 'openmoji/color/svg/1F438.svg'
import koala from 'openmoji/color/svg/1F428.svg'
import lion from 'openmoji/color/svg/1F981.svg'
import octopus from 'openmoji/color/svg/1F419.svg'
import panda from 'openmoji/color/svg/1F43C.svg'
import parrot from 'openmoji/color/svg/1F99C.svg'
import turtle from 'openmoji/color/svg/1F422.svg'
import unicorn from 'openmoji/color/svg/1F984.svg'

export const PLAYER_AVATAR_OPTIONS = [
  { key: 'fox', label: 'Fox', src: fox },
  { key: 'bear', label: 'Bear', src: bear },
  { key: 'panda', label: 'Panda', src: panda },
  { key: 'koala', label: 'Koala', src: koala },
  { key: 'lion', label: 'Lion', src: lion },
  { key: 'cat', label: 'Cat', src: cat },
  { key: 'frog', label: 'Frog', src: frog },
  { key: 'unicorn', label: 'Unicorn', src: unicorn },
  { key: 'butterfly', label: 'Butterfly', src: butterfly },
  { key: 'dolphin', label: 'Dolphin', src: dolphin },
  { key: 'octopus', label: 'Octopus', src: octopus },
  { key: 'flamingo', label: 'Flamingo', src: flamingo },
  { key: 'parrot', label: 'Parrot', src: parrot },
  { key: 'bee', label: 'Bee', src: bee },
  { key: 'crocodile', label: 'Crocodile', src: crocodile },
  { key: 'turtle', label: 'Turtle', src: turtle },
]

export const DEFAULT_PLAYER_AVATAR_KEY = PLAYER_AVATAR_OPTIONS[0].key

const LEGACY_AVATAR_KEY_MAP = {
  puzzle: 'octopus',
  sparkles: 'butterfly',
  wave: 'dolphin',
  fire: 'lion',
  bullseye: 'fox',
  compass: 'turtle',
  processor: 'bee',
  hive: 'bee',
  miner: 'bear',
  palm: 'parrot',
  '🧩': 'octopus',
  '⚡': 'butterfly',
  '🌿': 'frog',
  '🔥': 'lion',
  '💫': 'unicorn',
  '🪐': 'dolphin',
  '🧠': 'bee',
  '🎯': 'fox',
  '🛰️': 'dolphin',
  '🌊': 'dolphin',
  'monkey-face': 'bear',
  'gorilla': 'bear',
  'fox': 'fox',
  'cat-face': 'cat',
  'lion': 'lion',
  'tiger-face': 'cat',
  'horse-face': 'unicorn',
  'zebra': 'turtle',
  'deer': 'turtle',
  'cow-face': 'bear',
  'pig-face': 'panda',
  'frog': 'frog',
  'koala': 'koala',
  'rabbit-face': 'unicorn',
  'bear-face': 'bear',
  'panda': 'panda',
  'penguin': 'dolphin',
  'owl': 'parrot',
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
