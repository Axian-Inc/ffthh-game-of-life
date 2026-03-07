import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'ffthh-game-of-life.games'

test('play entry surface renders welcome page and returns to home', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((storageKey) => {
    const now = Date.now()
    const games = [
      {
        id: 'welcome-1',
        name: 'Welcome Journey',
        status: 'active',
        players: [
          { id: 'p1', name: 'Jordan', avatar: 'fox', careerTrack: 'degree' },
          { id: 'p2', name: 'Mina', avatar: 'tiger-face', careerTrack: 'creator' },
        ],
        resumable: true,
        createdAt: now,
        lastUpdated: now,
      },
    ]
    window.localStorage.clear()
    window.localStorage.setItem(storageKey, JSON.stringify(games))
  }, STORAGE_KEY)
  await page.goto('/games/welcome-1/play')
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;}',
  })

  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()
  await expect(page.getByRole('button', { name: "Let's Begin!" })).toBeVisible()
  await expect(page.getByText('Game board coming soon.')).toHaveCount(0)

  const screenshot = await page.screenshot({ fullPage: true })
  expect(screenshot.length).toBeGreaterThan(10000)

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL('/')
})
