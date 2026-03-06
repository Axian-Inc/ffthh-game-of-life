import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'ffthh-game-of-life.games'

const createGame = (id, name) => ({
  id,
  name,
  status: 'active',
  players: [{ id: `${id}-p1`, name: 'Alex', avatar: 'fox', careerTrack: 'degree' }],
  resumable: true,
  createdAt: 1735689600000,
  lastUpdated: 1735689600000,
})

test('home screen renders single-column resumable cards', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(({ storageKey, games }) => {
    window.localStorage.clear()
    window.localStorage.setItem(storageKey, JSON.stringify(games))
  }, {
    storageKey: STORAGE_KEY,
    games: [createGame('game-1', 'Choices Matter'), createGame('game-2', 'Family Night')],
  })
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Choices Matter' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Family Night' })).toBeVisible()

  const screenshot = await page.screenshot({ fullPage: true })
  expect(screenshot.length).toBeGreaterThan(10000)
})
