import bat from 'openmoji/color/svg/1F987.svg'
import blowfish from 'openmoji/color/svg/1F421.svg'
import catFace from 'openmoji/color/svg/1F431.svg'
import crab from 'openmoji/color/svg/1F980.svg'
import crocodile from 'openmoji/color/svg/1F40A.svg'
import dolphin from 'openmoji/color/svg/1F42C.svg'
import dragon from 'openmoji/color/svg/1F409.svg'
import dragonFace from 'openmoji/color/svg/1F432.svg'
import fox from 'openmoji/color/svg/1F98A.svg'
import gorilla from 'openmoji/color/svg/1F98D.svg'
import jellyfish from 'openmoji/color/svg/1FABC.svg'
import lion from 'openmoji/color/svg/1F981.svg'
import lizard from 'openmoji/color/svg/1F98E.svg'
import lobster from 'openmoji/color/svg/1F99E.svg'
import monkeyFace from 'openmoji/color/svg/1F435.svg'
import octopus from 'openmoji/color/svg/1F419.svg'
import sauropod from 'openmoji/color/svg/1F995.svg'
import scorpion from 'openmoji/color/svg/1F982.svg'
import shark from 'openmoji/color/svg/1F988.svg'
import shrimp from 'openmoji/color/svg/1F990.svg'
import snake from 'openmoji/color/svg/1F40D.svg'
import squid from 'openmoji/color/svg/1F991.svg'
import tRex from 'openmoji/color/svg/1F996.svg'
import turtle from 'openmoji/color/svg/1F422.svg'
import whale from 'openmoji/color/svg/1F433.svg'

export const PLAYER_AVATAR_OPTIONS = [
  { key: 'octopus', label: 'Octopus', src: octopus },
  { key: 'snake', label: 'Snake', src: snake },
  { key: 'turtle', label: 'Turtle', src: turtle },
  { key: 'lizard', label: 'Lizard', src: lizard },
  { key: 'crocodile', label: 'Crocodile', src: crocodile },
  { key: 't-rex', label: 'T-Rex', src: tRex },
  { key: 'sauropod', label: 'Sauropod', src: sauropod },
  { key: 'dragon', label: 'Dragon', src: dragon },
  { key: 'dragon-face', label: 'Dragon Face', src: dragonFace },
  { key: 'scorpion', label: 'Scorpion', src: scorpion },
  { key: 'bat', label: 'Bat', src: bat },
  { key: 'crab', label: 'Crab', src: crab },
  { key: 'squid', label: 'Squid', src: squid },
  { key: 'shrimp', label: 'Shrimp', src: shrimp },
  { key: 'lobster', label: 'Lobster', src: lobster },
  { key: 'shark', label: 'Shark', src: shark },
  { key: 'whale', label: 'Whale', src: whale },
  { key: 'dolphin', label: 'Dolphin', src: dolphin },
  { key: 'blowfish', label: 'Blowfish', src: blowfish },
  { key: 'jellyfish', label: 'Jellyfish', src: jellyfish },
  { key: 'monkey-face', label: 'Monkey Face', src: monkeyFace },
  { key: 'gorilla', label: 'Gorilla', src: gorilla },
  { key: 'fox', label: 'Fox', src: fox },
  { key: 'cat-face', label: 'Cat Face', src: catFace },
  { key: 'lion', label: 'Lion', src: lion },
]

export const DEFAULT_PLAYER_AVATAR_KEY = PLAYER_AVATAR_OPTIONS[0].key

const LEGACY_AVATAR_KEY_MAP = {
  puzzle: 'octopus',
  sparkles: 'jellyfish',
  wave: 'dolphin',
  fire: 'dragon',
  bullseye: 'blowfish',
  compass: 'turtle',
  processor: 'dragon-face',
  hive: 'lobster',
  miner: 'crab',
  palm: 'dolphin',
  '🧩': 'octopus',
  '⚡': 'jellyfish',
  '🌿': 'dolphin',
  '🔥': 'dragon',
  '💫': 'jellyfish',
  '🪐': 'lobster',
  '🧠': 'dragon-face',
  '🎯': 'blowfish',
  '🛰️': 'lobster',
  '🌊': 'dolphin',
  'monkey-face': 'bat',
  'gorilla': 't-rex',
  'fox': 'lizard',
  'cat-face': 'dragon-face',
  'lion': 'dragon',
  'tiger-face': 'crocodile',
  'horse-face': 'sauropod',
  'zebra': 'shark',
  'deer': 'turtle',
  'cow-face': 'whale',
  'pig-face': 'blowfish',
  'frog': 'crocodile',
  'koala': 'turtle',
  'rabbit-face': 'shrimp',
  'bear-face': 'whale',
  'panda': 'lobster',
  'penguin': 'dolphin',
  'owl': 'jellyfish',
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
