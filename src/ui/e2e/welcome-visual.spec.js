import { expect, test } from '@playwright/test'

const storageKey = 'ffthh-game-of-life.games'

const disableAnimations = async (page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `,
  })
}

test('welcome page visual baseline for /games/:id/play', async ({ page }) => {
  await page.addInitScript(({ key }) => {
    const now = Date.now()
    const games = [
      {
        id: 'choices-matter',
        name: 'Choices Matter',
        status: 'active',
        players: [
          { name: 'Jules', avatar: 'monkey-face' },
          { name: 'Seth', avatar: 'owl' },
          { name: 'Ari', avatar: 'koala' },
          { name: 'Mira', avatar: 'tiger-face' },
        ],
        lastUpdated: now,
        createdAt: now,
        resumable: true,
      },
    ]
    window.localStorage.setItem(key, JSON.stringify(games))
  }, { key: storageKey })

  await page.goto('/games/choices-matter/play')
  await disableAnimations(page)

  await expect(page.getByRole('heading', { level: 2, name: 'Welcome to Life!' })).toBeVisible()
  await expect(page.getByRole('button', { name: "Let's Begin!" })).toBeVisible()
  await expect(page.getByText('Game board coming soon.')).toHaveCount(0)
  await expect(page).toHaveScreenshot('welcome-visual.png')
})

test("welcome CTA returns to '/'", async ({ page }) => {
  await page.addInitScript(({ key }) => {
    const now = Date.now()
    const games = [
      {
        id: 'choices-matter',
        name: 'Choices Matter',
        status: 'active',
        players: [
          { name: 'Jules', avatar: 'monkey-face' },
          { name: 'Seth', avatar: 'owl' },
          { name: 'Ari', avatar: 'koala' },
          { name: 'Mira', avatar: 'tiger-face' },
        ],
        lastUpdated: now,
        createdAt: now,
        resumable: true,
      },
    ]
    window.localStorage.setItem(key, JSON.stringify(games))
  }, { key: storageKey })

  await page.goto('/games/choices-matter/play')
  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Game of LIFE' })).toBeVisible()
})
