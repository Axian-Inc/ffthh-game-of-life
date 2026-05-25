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

test('home desktop baseline matches screen 1 single-card anatomy', async ({ page }) => {
  const now = Date.now()
  await setGames(page, [
    {
      id: 'choices-matter',
      name: 'Choices Matter',
      status: 'active',
      players: [
        { name: 'Ari', avatar: 'panda', careerTrack: 'Degree Track' },
        { name: 'Jo', avatar: 'fox', careerTrack: 'Trades Track' },
        { name: 'Sam', avatar: 'frog', careerTrack: 'Degree Track' },
        { name: 'Luz', avatar: 'owl', careerTrack: 'Creator Track' },
      ],
      lastUpdated: now,
      createdAt: now,
      resumable: true,
    },
  ])

  await expect(page.getByRole('heading', { name: 'Choices Matter' })).toBeVisible()
  await expect(page.getByText('4 players')).toBeVisible()
  await expect(page.getByText('just now')).toBeVisible()
  await expect(page.getByText('ACTIVE')).toBeVisible()

  await expect(page.locator('.page')).toHaveScreenshot(
    'home-desktop-single-card.png',
    visualSnapshotOptions,
  )
})

test('home multi-game desktop layout keeps explicit vertical card separation', async ({ page }) => {
  const now = Date.now()
  await setGames(page, [
    {
      id: 'game-1',
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
    {
      id: 'game-2',
      name: 'Weekend Plan',
      status: 'active',
      players: [
        { name: 'Sam', avatar: 'frog', careerTrack: 'Degree Track' },
        { name: 'Luz', avatar: 'owl', careerTrack: 'Creator Track' },
      ],
      lastUpdated: now,
      createdAt: now,
      resumable: true,
    },
    {
      id: 'game-3',
      name: 'Life Routes',
      status: 'paused',
      players: [
        { name: 'Kai', avatar: 'tiger-face', careerTrack: 'Degree Track' },
        { name: 'Vic', avatar: 'penguin', careerTrack: 'Trades Track' },
      ],
      lastUpdated: now,
      createdAt: now,
      resumable: false,
    },
  ])

  const cards = page.locator('.game-card')
  await expect(cards).toHaveCount(3)
  const first = await cards.nth(0).boundingBox()
  const second = await cards.nth(1).boundingBox()
  expect(first).not.toBeNull()
  expect(second).not.toBeNull()
  expect(second.y - (first.y + first.height)).toBeGreaterThanOrEqual(24)

  await expect(page.locator('.page')).toHaveScreenshot(
    'home-desktop-multi-game-column.png',
    visualSnapshotOptions,
  )
})
