import { test, expect } from '@playwright/test'

const STORAGE_KEY = 'ffthh-game-of-life.games'
const visualSnapshotOptions = {
  maxDiffPixels: 6500,
}

const disableAnimations = async (page) => {
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;}',
  })
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
  await disableAnimations(page)
}

test('direct /games/:id/play route opens Welcome and does not show placeholder board content', async ({
  page,
}) => {
  const now = Date.now()
  const game = {
    id: 'welcome-route',
    name: 'Choices Matter',
    status: 'active',
    players: [
      { name: 'Ari', avatar: 'panda', careerTrack: 'Degree Track' },
      { name: 'Jo', avatar: 'fox', careerTrack: 'Trades Track' },
    ],
    lastUpdated: now,
    createdAt: now,
    resumable: true,
  }
  await setGames(page, [game])
  await page.goto(`/games/${game.id}/play`)
  await disableAnimations(page)

  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()
  await expect(page.getByRole('button', { name: "Let's Begin!" })).toBeVisible()
  await expect(page.getByText('Game board coming soon.')).toHaveCount(0)
  await expect(page.getByText('placeholder content for the play experience')).toHaveCount(0)
  await expect
    .poll(() => page.evaluate(() => window.life.status().entrySource))
    .toBe('route')
  await expect
    .poll(() => page.evaluate(() => window.life.status().playScreen))
    .toBe('welcome')

  await expect(page.locator('.page')).toHaveScreenshot(
    'welcome-desktop-baseline.png',
    visualSnapshotOptions,
  )
})

test('resume lands on Welcome and Let\'s Begin opens the turn screen in-place', async ({ page }) => {
  const now = Date.now()
  await setGames(page, [
    {
      id: 'resume-route',
      name: 'Choices Matter',
      status: 'active',
      players: [
        { name: 'Ari', avatar: 'panda', careerTrack: 'Degree Track' },
        { name: 'Jo', avatar: 'fox', careerTrack: 'Trades Track' },
      ],
      lastUpdated: now,
      createdAt: now,
      resumable: true,
    },
  ])

  await page.getByRole('button', { name: 'Resume' }).click()
  await expect(page).toHaveURL(/\/games\/resume-route\/play$/)
  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => window.life.status().entrySource))
    .toBe('resume')

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL(/\/games\/resume-route\/play$/)
  await expect(page.getByRole('heading', { name: 'Modern Game of Life - Turn 10' })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => window.life.status().playScreen))
    .toBe('turn')
})
