import { test, expect } from '@playwright/test'

const STORAGE_KEY = 'ffthh-game-of-life.games'
const visualSnapshotOptions = {
  maxDiffPixels: 6500,
}

const setGames = async (page, games) => {
  await page.goto('/')
  await page.evaluate(
    ({ storageKey, records }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(records))
    },
    { storageKey: STORAGE_KEY, records: games },
  )
  await page.reload()
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;}',
  })
}

test('direct /games/:id/play route opens the turn hub for a saved game', async ({
  page,
}) => {
  const now = Date.now()
  const game = {
    id: 'welcome-route',
    name: 'Choices Matter',
    status: 'turn_ready',
    activePlayerIndex: 0,
    currentMonth: 1,
    version: 1,
    randomSeed: 'seed-1',
    players: [
      { id: 'player-1', name: 'Ari', avatar: 'panda', careerId: 'degree-track', cityId: 'suburbia', cash: 1000, debts: [], assets: [], netWorth: 1000, physicalHealth: 100, mentalHealth: 100, statusEffects: [], actionHistory: [] },
      { id: 'player-2', name: 'Jo', avatar: 'fox', careerId: 'trades-track', cityId: 'metro', cash: 1000, debts: [], assets: [], netWorth: 1000, physicalHealth: 100, mentalHealth: 100, statusEffects: [], actionHistory: [] },
    ],
    availableActions: [
      {
        id: 'side-gig',
        label: 'Side Gig',
        description: 'Extra income now with some health tradeoff.',
        preview: {
          cash: [350, 550],
          netWorth: [350, 550],
          physicalHealth: [-2, -1],
          mentalHealth: [-2, -1],
          riskNotes: ['Can relieve cash pressure but increases fatigue.'],
        },
      },
    ],
    lastUpdated: now,
    createdAt: now,
  }
  await setGames(page, [game])
  await page.goto(`/games/${game.id}/play`)

  await expect(page.getByRole('heading', { name: /Ari's Turn/i })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Take Turn' })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => window.life.status().entrySource))
    .toBe('route')

  await expect(page.locator('.page')).toHaveScreenshot(
    'welcome-desktop-baseline.png',
    visualSnapshotOptions,
  )
})

test('resume lands on the turn hub and can resolve into handoff', async ({ page }) => {
  const now = Date.now()
  await setGames(page, [
    {
      id: 'resume-route',
      name: 'Choices Matter',
      status: 'turn_ready',
      activePlayerIndex: 0,
      currentMonth: 1,
      version: 1,
      randomSeed: 'seed-1',
      players: [
        { id: 'player-1', name: 'Ari', avatar: 'panda', careerId: 'degree-track', cityId: 'suburbia', cash: 1000, debts: [], assets: [], netWorth: 1000, physicalHealth: 100, mentalHealth: 100, statusEffects: [], actionHistory: [] },
        { id: 'player-2', name: 'Jo', avatar: 'fox', careerId: 'trades-track', cityId: 'metro', cash: 1000, debts: [], assets: [], netWorth: 1000, physicalHealth: 100, mentalHealth: 100, statusEffects: [], actionHistory: [] },
      ],
      availableActions: [
        {
          id: 'side-gig',
          label: 'Side Gig',
          description: 'Extra income now with some health tradeoff.',
          preview: {
            cash: [350, 550],
            netWorth: [350, 550],
            physicalHealth: [-2, -1],
            mentalHealth: [-2, -1],
            riskNotes: ['Can relieve cash pressure but increases fatigue.'],
          },
        },
      ],
      lastUpdated: now,
      createdAt: now,
    },
  ])

  await page.getByRole('button', { name: 'Resume' }).click()
  await expect(page).toHaveURL(/\/games\/resume-route\/play$/)
  await expect(page.getByRole('heading', { name: /Ari's Turn/i })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => window.life.status().entrySource))
    .toBe('resume')

  await page.getByRole('button', { name: /Side Gig/i }).click()
  await page.getByRole('button', { name: 'Take Turn' }).click()
  await expect(page.getByRole('heading', { name: /finished month 1/i })).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: 'Jo' })).toBeVisible()
})
