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

test('play turn desktop layout matches the player-turn mock anatomy', async ({ page }) => {
  const now = Date.now()
  await setGames(page, [
    {
      id: 'turn-route',
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

  await page.goto('/games/turn-route/play')
  await disableAnimations(page)
  await page.getByRole('button', { name: "Let's Begin!" }).click()

  await expect(page.getByRole('heading', { name: 'Modern Game of Life - Turn 10' })).toBeVisible()
  await expect(page.getByText('Net Worth:')).toBeVisible()
  await expect(page.getByText('Modifier Icons')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Choose Action' })).toBeVisible()

  await expect(page.locator('.page')).toHaveScreenshot(
    'play-turn-desktop-baseline.png',
    visualSnapshotOptions,
  )
})
