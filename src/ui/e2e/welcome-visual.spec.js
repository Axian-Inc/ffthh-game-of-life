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

  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()
  await expect(page.getByRole('button', { name: "Let's Begin!" })).toBeVisible()
  await expect(page.getByText('Game board coming soon.')).toHaveCount(0)
  await expect(page.getByText('placeholder content for the play experience')).toHaveCount(0)

  await expect(page.locator('.page')).toHaveScreenshot(
    'welcome-desktop-baseline.png',
    visualSnapshotOptions,
  )
})

test('resume lands on Welcome and Let\'s Begin routes back to home', async ({ page }) => {
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

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Game of LIFE' })).toBeVisible()
})
