const toSeed = (seedText) => {
  const source = String(seedText || 'ffthh-life-seed')
  let hash = 2166136261
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export const createSeededRng = (seedText) => {
  let state = toSeed(seedText) || 1

  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    const next = state >>> 0
    return next / 4294967296
  }
}

export const randomIntInclusive = (rng, min, max) => {
  if (max <= min) {
    return min
  }
  return min + Math.floor(rng() * (max - min + 1))
}
