const { parseStringPromise } = require('xml2js')

const SOURCE_FETCH_TIMEOUT_MS = 2500
const MAX_FEED_BYTES = 512 * 1024
const MAX_DESCRIPTION_LENGTH = 4000
const MAX_HEADLINE_LENGTH = 300
const MAX_REDIRECTS = 3
const ARTICLE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000

const APPROVED_CONTENT_SOURCES = Object.freeze([
  Object.freeze({
    id: 'noaa-nos-news',
    publisher: 'NOAA National Ocean Service',
    url: 'https://oceanservice.noaa.gov/rss/nosnews.xml',
    hostname: 'oceanservice.noaa.gov',
  }),
])

class ContentSourceError extends Error {
  constructor(code, message, { sourceId = null, cause = null } = {}) {
    super(message, cause ? { cause } : undefined)
    this.name = 'ContentSourceError'
    this.code = code
    this.sourceId = sourceId
  }
}

const hashText = (value) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const buildTurnKey = ({ gameId, turnNumber, playerId } = {}) => {
  if (gameId == null || playerId == null || !Number.isInteger(turnNumber) || turnNumber < 1) {
    throw new ContentSourceError('INVALID_TURN_CONTEXT', 'A game id, player id, and positive turn number are required.')
  }
  return `${String(gameId)}:${turnNumber}:${String(playerId)}`
}

const selectApprovedSource = (turnContext) => {
  const turnKey = buildTurnKey(turnContext)
  return APPROVED_CONTENT_SOURCES[hashText(turnKey) % APPROVED_CONTENT_SOURCES.length]
}

const assertAllowedUrl = (candidate, source) => {
  let parsed
  try {
    parsed = new URL(candidate)
  } catch (error) {
    throw new ContentSourceError('INVALID_SOURCE_URL', 'The source URL is invalid.', {
      sourceId: source.id,
      cause: error,
    })
  }

  if (parsed.protocol !== 'https:' || parsed.hostname !== source.hostname || parsed.username || parsed.password) {
    throw new ContentSourceError('SOURCE_URL_NOT_ALLOWED', 'The source URL is outside the approved host.', {
      sourceId: source.id,
    })
  }
  return parsed
}

const readLimitedBody = async (response, source) => {
  const declaredLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FEED_BYTES) {
    throw new ContentSourceError('SOURCE_TOO_LARGE', 'The source response exceeds the size limit.', {
      sourceId: source.id,
    })
  }

  if (!response.body?.getReader) {
    const body = Buffer.from(await response.arrayBuffer())
    if (body.length > MAX_FEED_BYTES) {
      throw new ContentSourceError('SOURCE_TOO_LARGE', 'The source response exceeds the size limit.', {
        sourceId: source.id,
      })
    }
    return body.toString('utf8')
  }

  const reader = response.body.getReader()
  const chunks = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    totalBytes += value.byteLength
    if (totalBytes > MAX_FEED_BYTES) {
      await reader.cancel()
      throw new ContentSourceError('SOURCE_TOO_LARGE', 'The source response exceeds the size limit.', {
        sourceId: source.id,
      })
    }
    chunks.push(Buffer.from(value))
  }

  return Buffer.concat(chunks, totalBytes).toString('utf8')
}

const fetchFeedXml = async (source, fetchImpl) => {
  const controller = new AbortController()
  let timeoutId

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort()
      reject(
        new ContentSourceError('SOURCE_TIMEOUT', 'The source request timed out.', {
          sourceId: source.id,
        }),
      )
    }, SOURCE_FETCH_TIMEOUT_MS)
  })

  const fetchPromise = (async () => {
    let currentUrl = assertAllowedUrl(source.url, source)

    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
      let response
      try {
        response = await fetchImpl(currentUrl, {
          headers: {
            Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
            'User-Agent': 'ModernGameOfLife/0.1 (educational content fetcher)',
          },
          redirect: 'manual',
          signal: controller.signal,
        })
      } catch (error) {
        if (error instanceof ContentSourceError) {
          throw error
        }
        throw new ContentSourceError('SOURCE_FETCH_FAILED', 'The source request failed.', {
          sourceId: source.id,
          cause: error,
        })
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (!location || redirects === MAX_REDIRECTS) {
          throw new ContentSourceError('SOURCE_REDIRECT_FAILED', 'The source returned an invalid redirect.', {
            sourceId: source.id,
          })
        }
        currentUrl = assertAllowedUrl(new URL(location, currentUrl).toString(), source)
        continue
      }

      if (!response.ok) {
        throw new ContentSourceError('SOURCE_HTTP_ERROR', `The source returned HTTP ${response.status}.`, {
          sourceId: source.id,
        })
      }

      const contentType = response.headers.get('content-type') || ''
      if (!/(?:rss|atom|xml)/i.test(contentType)) {
        throw new ContentSourceError('SOURCE_CONTENT_TYPE_INVALID', 'The source did not return an XML feed.', {
          sourceId: source.id,
        })
      }

      return readLimitedBody(response, source)
    }

    throw new ContentSourceError('SOURCE_REDIRECT_FAILED', 'The source exceeded the redirect limit.', {
      sourceId: source.id,
    })
  })()

  try {
    return await Promise.race([fetchPromise, timeoutPromise])
  } finally {
    clearTimeout(timeoutId)
  }
}

const asArray = (value) => {
  if (value == null) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

const readTextValue = (value) => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }
  if (!value || typeof value !== 'object') {
    return ''
  }
  return readTextValue(value._ ?? value['#text'] ?? '')
}

const decodeCodePoint = (value, radix) => {
  const codePoint = Number.parseInt(value, radix)
  return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
    ? String.fromCodePoint(codePoint)
    : ''
}

const decodeEntities = (value) =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => decodeCodePoint(code, 16))
    .replace(/&#([0-9]+);/g, (_, code) => decodeCodePoint(code, 10))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')

const removeTrackingParameters = (value) =>
  value.replace(/https?:\/\/[^\s<>"']+/gi, (match) => {
    const trailing = match.match(/[),.!?;:]+$/)?.[0] || ''
    const candidate = trailing ? match.slice(0, -trailing.length) : match
    try {
      const url = new URL(candidate)
      for (const key of [...url.searchParams.keys()]) {
        if (/^(?:utm_.+|fbclid|gclid|mc_cid|mc_eid)$/i.test(key)) {
          url.searchParams.delete(key)
        }
      }
      return `${url.toString()}${trailing}`
    } catch {
      return match
    }
  })

const INSTRUCTION_PATTERN =
  /\b(?:ignore|disregard|override|forget)\b.{0,100}\b(?:instructions?|prompts?|rules?)\b|\b(?:system|developer|assistant|user)\s*:/i

const sanitizeText = (value, maxLength) => {
  let text = readTextValue(value)
  text = decodeEntities(decodeEntities(text))
  text = text.replace(/<(?:script|style|template|noscript)\b[^>]*>[\s\S]*?<\/(?:script|style|template|noscript)>/gi, ' ')
  text = text.replace(/<\/?(?:p|div|li|br|h[1-6]|section|article)\b[^>]*>/gi, '\n')
  text = text.replace(/<[^>]+>/g, ' ')
  text = text
    .split(/\n+|(?<=[.!?])\s+/)
    .filter((segment) => !INSTRUCTION_PATTERN.test(segment))
    .join(' ')
  text = removeTrackingParameters(decodeEntities(text))
  return text.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

const parsePublishedAt = (value) => {
  const timestamp = Date.parse(readTextValue(value))
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

const normalizeFeedEntries = (parsed) => {
  const rssItems = asArray(parsed?.rss?.channel?.item)
  if (rssItems.length > 0) {
    return rssItems.map((item) => ({
      headline: sanitizeText(item.title, MAX_HEADLINE_LENGTH),
      publishedAt: parsePublishedAt(item.pubdate ?? item.pubDate ?? item.published ?? item.updated),
      description: sanitizeText(item['content:encoded'] ?? item.description ?? item.summary, MAX_DESCRIPTION_LENGTH),
    }))
  }

  return asArray(parsed?.feed?.entry).map((entry) => ({
    headline: sanitizeText(entry.title, MAX_HEADLINE_LENGTH),
    publishedAt: parsePublishedAt(entry.published ?? entry.updated),
    description: sanitizeText(entry.content ?? entry.summary, MAX_DESCRIPTION_LENGTH),
  }))
}

const parseFeed = async (xml, source) => {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new ContentSourceError('SOURCE_XML_UNSAFE', 'The source feed contains a prohibited XML declaration.', {
      sourceId: source.id,
    })
  }

  let parsed
  try {
    parsed = await parseStringPromise(xml, {
      async: true,
      explicitArray: false,
      normalize: true,
      normalizeTags: true,
      strict: false,
      trim: true,
    })
  } catch (error) {
    throw new ContentSourceError('SOURCE_XML_INVALID', 'The source feed could not be parsed.', {
      sourceId: source.id,
      cause: error,
    })
  }

  const entries = normalizeFeedEntries(parsed).filter((entry) => entry.headline && entry.description)
  if (entries.length === 0) {
    throw new ContentSourceError('SOURCE_EMPTY', 'The source feed contains no usable articles.', {
      sourceId: source.id,
    })
  }
  return entries
}

const selectArticle = (entries, source, turnContext, now) => {
  const cutoff = now.getTime() - ARTICLE_MAX_AGE_MS
  const recentEntries = entries.filter(
    (entry) => entry.publishedAt && new Date(entry.publishedAt).getTime() >= cutoff,
  )
  const eligibleEntries = recentEntries.length > 0 ? recentEntries : entries
  const articleIndex = hashText(`${buildTurnKey(turnContext)}:${source.id}`) % eligibleEntries.length
  return eligibleEntries[articleIndex]
}

const retrieveApprovedContent = async (turnContext, { fetchImpl = globalThis.fetch, now = new Date() } = {}) => {
  if (typeof fetchImpl !== 'function') {
    throw new ContentSourceError('SOURCE_FETCH_UNAVAILABLE', 'No source fetch implementation is available.')
  }
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new ContentSourceError('INVALID_CURRENT_TIME', 'A valid current time is required.')
  }

  const source = selectApprovedSource(turnContext)
  try {
    const xml = await fetchFeedXml(source, fetchImpl)
    const entries = await parseFeed(xml, source)
    const article = selectArticle(entries, source, turnContext, now)

    return {
      sourceId: source.id,
      publisher: source.publisher,
      headline: article.headline,
      publishedAt: article.publishedAt,
      description: article.description,
    }
  } catch (error) {
    if (error instanceof ContentSourceError) {
      throw error
    }
    throw new ContentSourceError('SOURCE_PROCESSING_FAILED', 'The source content could not be processed.', {
      sourceId: source.id,
      cause: error,
    })
  }
}

module.exports = {
  APPROVED_CONTENT_SOURCES,
  ARTICLE_MAX_AGE_MS,
  ContentSourceError,
  MAX_DESCRIPTION_LENGTH,
  MAX_FEED_BYTES,
  SOURCE_FETCH_TIMEOUT_MS,
  retrieveApprovedContent,
  selectApprovedSource,
}
