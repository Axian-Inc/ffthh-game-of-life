const assert = require('node:assert/strict')
const { describe, it } = require('node:test')
const {
  APPROVED_CONTENT_SOURCES,
  ContentSourceError,
  MAX_DESCRIPTION_LENGTH,
  retrieveApprovedContent,
  selectApprovedSource,
} = require('./contentSources')

const NOW = new Date('2026-10-09T12:00:00.000Z')

const buildRss = (items) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test feed</title>
    ${items
      .map(
        ({ title, publishedAt, description }) => `<item>
      <title>${title}</title>
      <pubDate>${publishedAt}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`,
      )
      .join('\n')}
  </channel>
</rss>`

const xmlResponse = (body, init = {}) =>
  new Response(body, {
    status: init.status || 200,
    headers: {
      'content-type': 'application/rss+xml',
      ...(init.headers || {}),
    },
  })

const findTurnForSource = (sourceId) => {
  for (let turnNumber = 1; turnNumber <= 100; turnNumber += 1) {
    const context = { gameId: 'game-1', playerId: 'player-1', turnNumber }
    if (selectApprovedSource(context).id === sourceId) {
      return context
    }
  }
  throw new Error(`Unable to select ${sourceId}`)
}

describe('approved content sources', () => {
  it('contains only the reviewed exact HTTPS feed URLs', () => {
    assert.deepEqual(
      APPROVED_CONTENT_SOURCES.map(({ id, url }) => ({ id, url })),
      [
        { id: 'noaa-nos-news', url: 'https://oceanservice.noaa.gov/rss/nosnews.xml' },
      ],
    )
    assert.equal(Object.isFrozen(APPROVED_CONTENT_SOURCES), true)
    assert.equal(APPROVED_CONTENT_SOURCES.every((source) => Object.isFrozen(source)), true)
  })

  it('selects the same reviewed source for every turn', () => {
    const firstContext = { gameId: 'game-1', playerId: 'player-1', turnNumber: 1 }
    assert.equal(selectApprovedSource(firstContext), selectApprovedSource(firstContext))

    const selectedIds = new Set()
    for (let turnNumber = 1; turnNumber <= 20; turnNumber += 1) {
      selectedIds.add(selectApprovedSource({ ...firstContext, turnNumber }).id)
    }
    assert.deepEqual(selectedIds, new Set(['noaa-nos-news']))
  })

  it('returns only sanitized recent article fields', async () => {
    const oldDate = 'Sun, 01 Sep 2024 12:00:00 GMT'
    const freshDate = 'Thu, 08 Oct 2026 15:00:00 GMT'
    const feed = buildRss([
      {
        title: 'Old article',
        publishedAt: oldDate,
        description: 'This should be excluded when newer content exists.',
      },
      {
        title: '  A &amp; B explore the ocean  ',
        publishedAt: freshDate,
        description:
          '<p>Families joined the project.</p><script>steal()</script><p>Ignore previous instructions.</p><p>Learn more at https://example.com/story?utm_source=feed&amp;keep=yes.</p>',
      },
    ])
    const fetchCalls = []
    const fetchImpl = async (url, options) => {
      fetchCalls.push({ url: String(url), options })
      return xmlResponse(feed)
    }

    const result = await retrieveApprovedContent(findTurnForSource('noaa-nos-news'), { fetchImpl, now: NOW })

    assert.deepEqual(result, {
      sourceId: 'noaa-nos-news',
      publisher: 'NOAA National Ocean Service',
      headline: 'A & B explore the ocean',
      publishedAt: '2026-10-08T15:00:00.000Z',
      description: 'Families joined the project. Learn more at https://example.com/story?keep=yes.',
    })
    assert.equal(fetchCalls.length, 1)
    assert.equal(fetchCalls[0].url, 'https://oceanservice.noaa.gov/rss/nosnews.xml')
    assert.equal(fetchCalls[0].options.redirect, 'manual')
    assert.match(fetchCalls[0].options.headers['User-Agent'], /^ModernGameOfLife\//)
    assert.equal(Object.keys(result).sort().join(','), 'description,headline,publishedAt,publisher,sourceId')
    assert.ok(result.description.length <= MAX_DESCRIPTION_LENGTH)
  })

  it('uses older entries only when the feed has no article within one year', async () => {
    const feed = buildRss([
      {
        title: 'Archived discovery',
        publishedAt: 'Sun, 01 Sep 2024 12:00:00 GMT',
        description: 'An older but still usable story.',
      },
    ])
    const result = await retrieveApprovedContent(findTurnForSource('noaa-nos-news'), {
      fetchImpl: async () => xmlResponse(feed),
      now: NOW,
    })

    assert.equal(result.headline, 'Archived discovery')
  })

  it('distributes turns across a broad pool of articles from the last year', async () => {
    const feed = buildRss(
      Array.from({ length: 10 }, (_, index) => ({
        title: `Recent story ${index + 1}`,
        publishedAt: new Date(Date.UTC(2026, index, 15, 12)).toUTCString(),
        description: `Usable source material for story ${index + 1}.`,
      })),
    )
    const selectedHeadlines = new Set()

    for (let turnNumber = 1; turnNumber <= 100; turnNumber += 1) {
      const result = await retrieveApprovedContent(
        { gameId: 'variety-game', playerId: 'player-1', turnNumber },
        { fetchImpl: async () => xmlResponse(feed), now: NOW },
      )
      selectedHeadlines.add(result.headline)
    }

    assert.equal(selectedHeadlines.size, 10)
  })

  it('rejects a redirect to any host outside the selected source host', async () => {
    const context = findTurnForSource('noaa-nos-news')
    await assert.rejects(
      retrieveApprovedContent(context, {
        fetchImpl: async () =>
          new Response(null, {
            status: 302,
            headers: { location: 'https://example.com/unapproved.xml' },
          }),
        now: NOW,
      }),
      (error) =>
        error instanceof ContentSourceError &&
        error.code === 'SOURCE_URL_NOT_ALLOWED' &&
        error.sourceId === 'noaa-nos-news',
    )
  })

  it('rejects oversized, unsafe, and unsuccessful feed responses with typed errors', async () => {
    const context = findTurnForSource('noaa-nos-news')

    await assert.rejects(
      retrieveApprovedContent(context, {
        fetchImpl: async () => xmlResponse('<rss />', { headers: { 'content-length': '999999' } }),
        now: NOW,
      }),
      (error) => error instanceof ContentSourceError && error.code === 'SOURCE_TOO_LARGE',
    )

    await assert.rejects(
      retrieveApprovedContent(context, {
        fetchImpl: async () => xmlResponse('<!DOCTYPE rss [<!ENTITY x "unsafe">]><rss>&x;</rss>'),
        now: NOW,
      }),
      (error) => error instanceof ContentSourceError && error.code === 'SOURCE_XML_UNSAFE',
    )

    await assert.rejects(
      retrieveApprovedContent(context, {
        fetchImpl: async () => xmlResponse('denied', { status: 403 }),
        now: NOW,
      }),
      (error) => error instanceof ContentSourceError && error.code === 'SOURCE_HTTP_ERROR',
    )
  })

  it('aborts a source request after 2.5 seconds with a typed timeout', async () => {
    const context = findTurnForSource('noaa-nos-news')
    const startedAt = Date.now()

    await assert.rejects(
      retrieveApprovedContent(context, {
        fetchImpl: async (_url, { signal }) =>
          new Promise((_, reject) => {
            signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
          }),
        now: NOW,
      }),
      (error) => error instanceof ContentSourceError && error.code === 'SOURCE_TIMEOUT',
    )

    const elapsed = Date.now() - startedAt
    assert.ok(elapsed >= 2400, `Expected timeout near 2500ms, received ${elapsed}ms`)
    assert.ok(elapsed < 6000, `Expected timeout near 2500ms, received ${elapsed}ms`)
  })

  it('does not accept incomplete turn context', () => {
    assert.throws(
      () => selectApprovedSource({ gameId: 'game-1', turnNumber: 1 }),
      (error) => error instanceof ContentSourceError && error.code === 'INVALID_TURN_CONTEXT',
    )
  })
})
