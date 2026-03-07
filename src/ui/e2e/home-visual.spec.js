import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'ffthh-game-of-life.games'

const createGame = (id, name, now) => ({
  id,
  name,
  status: 'active',
  players: [
    { id: `${id}-p1`, name: 'Alex', avatar: 'fox', careerTrack: 'degree' },
    { id: `${id}-p2`, name: 'Jordan', avatar: 'panda', careerTrack: 'creator' },
    { id: `${id}-p3`, name: 'Mina', avatar: 'tiger-face', careerTrack: 'trades' },
    { id: `${id}-p4`, name: 'Sam', avatar: 'koala', careerTrack: 'degree' },
  ],
  resumable: true,
  createdAt: now,
  lastUpdated: now,
})

test('home screen renders single-column resumable cards', async ({ page }) => {
  const now = Date.now()
  const games = [createGame('game-1', 'Choices Matter', now), createGame('game-2', 'Family Night', now)]
  await page.goto('/')
  await page.evaluate(({ storageKey, preloadedGames }) => {
    window.localStorage.clear()
    window.localStorage.setItem(storageKey, JSON.stringify(preloadedGames))
  }, {
    storageKey: STORAGE_KEY,
    preloadedGames: games,
  })
  await page.reload()
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;}',
  })

  await expect(page.getByRole('heading', { name: 'Choices Matter' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Family Night' })).toBeVisible()
  await expect(page.getByText('4 players').first()).toBeVisible()
  await expect(page.getByText('just now').first()).toBeVisible()
  await expect(page.getByText('ACTIVE').first()).toBeVisible()

  const firstCard = page.locator('.game-items > li', { has: page.getByRole('heading', { name: 'Choices Matter' }) })
  const secondCard = page.locator('.game-items > li', { has: page.getByRole('heading', { name: 'Family Night' }) })
  const firstBounds = await firstCard.boundingBox()
  const secondBounds = await secondCard.boundingBox()
  expect(firstBounds).not.toBeNull()
  expect(secondBounds).not.toBeNull()
  const verticalGap = secondBounds.y - (firstBounds.y + firstBounds.height)
  expect(verticalGap).toBeGreaterThanOrEqual(24)

  const screenshot = await page.screenshot({ fullPage: true })
  expect(screenshot.length).toBeGreaterThan(10000)
})
