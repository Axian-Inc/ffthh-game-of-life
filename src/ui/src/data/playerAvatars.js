import bat from 'openmoji/color/svg/1F987.svg'
import blowfish from 'openmoji/color/svg/1F421.svg'
import crab from 'openmoji/color/svg/1F980.svg'
import dragon from 'openmoji/color/svg/1F409.svg'
import dragonFace from 'openmoji/color/svg/1F432.svg'
import jellyfish from 'openmoji/color/svg/1FABC.svg'
import lobster from 'openmoji/color/svg/1F99E.svg'
import octopus from 'openmoji/color/svg/1F419.svg'
import scorpion from 'openmoji/color/svg/1F982.svg'
import shark from 'openmoji/color/svg/1F988.svg'
import snake from 'openmoji/color/svg/1F40D.svg'
import squid from 'openmoji/color/svg/1F991.svg'
import tRex from 'openmoji/color/svg/1F996.svg'
import turtle from 'openmoji/color/svg/1F422.svg'
import whale from 'openmoji/color/svg/1F433.svg'
import butterfly from 'openmoji/color/svg/1F98B.svg'
import ladyBeetle from 'openmoji/color/svg/1F41E.svg'
import penguin from 'openmoji/color/svg/1F427.svg'
import unicorn from 'openmoji/color/svg/1F984.svg'

export const PLAYER_AVATAR_OPTIONS = [
  { key: 'octopus', label: 'Octopus', src: octopus },
  { key: 'snake', label: 'Snake', src: snake },
  { key: 'turtle', label: 'Turtle', src: turtle },
  { key: 'lady-beetle', label: 'Lady Beetle', src: ladyBeetle },
  { key: 't-rex', label: 'T-Rex', src: tRex },
  { key: 'penguin', label: 'Penguin', src: penguin },
  { key: 'dragon', label: 'Dragon', src: dragon },
  { key: 'dragon-face', label: 'Dragon Face', src: dragonFace },
  { key: 'scorpion', label: 'Scorpion', src: scorpion },
  { key: 'bat', label: 'Bat', src: bat },
  { key: 'crab', label: 'Crab', src: crab },
  { key: 'squid', label: 'Squid', src: squid },
  { key: 'butterfly', label: 'Butterfly', src: butterfly },
  { key: 'lobster', label: 'Lobster', src: lobster },
  { key: 'shark', label: 'Shark', src: shark },
  { key: 'whale', label: 'Whale', src: whale },
  { key: 'blowfish', label: 'Blowfish', src: blowfish },
  { key: 'jellyfish', label: 'Jellyfish', src: jellyfish },
  { key: 'unicorn', label: 'Unicorn', src: unicorn },
]

export const DEFAULT_PLAYER_AVATAR_KEY = PLAYER_AVATAR_OPTIONS[0].key

export const getPlayerAvatarOption = (avatarValue) => {
  if (!avatarValue) {
    return null
  }

  return PLAYER_AVATAR_OPTIONS.find((option) => option.key === avatarValue) || null
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
