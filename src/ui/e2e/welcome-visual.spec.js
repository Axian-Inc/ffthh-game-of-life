import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'ffthh-game-of-life.games'

test('play entry surface renders and can return to home', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((storageKey) => {
    const games = [
      {
        id: 'welcome-1',
        name: 'Welcome Journey',
        status: 'active',
        players: [{ id: 'p1', name: 'Jordan', avatar: 'fox', careerTrack: 'degree' }],
        resumable: true,
        createdAt: 1735689600000,
        lastUpdated: 1735689600000,
      },
    ]
    window.localStorage.clear()
    window.localStorage.setItem(storageKey, JSON.stringify(games))
  }, STORAGE_KEY)
  await page.goto('/games/welcome-1/play')

  await expect(page.getByRole('heading', { name: 'Welcome Journey' })).toBeVisible()

  const screenshot = await page.screenshot({ fullPage: true })
  expect(screenshot.length).toBeGreaterThan(10000)

  await page.getByRole('button', { name: 'Back to home' }).click()
  await expect(page).toHaveURL('/')
})
