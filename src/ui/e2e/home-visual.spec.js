import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const STORAGE_KEY = 'ffthh-game-of-life.games'
const NOW = 1_760_000_000_000

const applyFixedClock = async (page) => {
  await page.addInitScript(({ now }) => {
    Date.now = () => now
  }, { now: NOW })
}

const seedGames = async (page, games) => {
  await page.addInitScript(
    ({ key, payload }) => window.localStorage.setItem(key, JSON.stringify(payload)),
    { key: STORAGE_KEY, payload: games },
  )
}

const assertScreenshot = async (page, baselineName) => {
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;}',
  })
  const actual = await page.screenshot()
  const expected = fs.readFileSync(new URL(`./__snapshots__/${baselineName}`, import.meta.url))
  expect(actual).toEqual(expected)
}

test('home desktop single-card baseline', async ({ page }) => {
  await applyFixedClock(page)
  await seedGames(page, [
    {
      id: 'choices-matter',
      name: 'Choices Matter',
      status: 'active',
      players: [
        { name: 'Ari', avatar: 'monkey-face' },
        { name: 'Jules', avatar: 'owl' },
        { name: 'Seth', avatar: 'koala' },
        { name: 'Mira', avatar: 'tiger-face' },
      ],
      lastUpdated: NOW,
      createdAt: NOW,
      resumable: true,
    },
  ])

  await page.goto('/')

  await expect(page.getByRole('heading', { level: 3, name: 'Choices Matter' })).toBeVisible()
  await assertScreenshot(page, 'home-single-desktop.png')
})

test('home desktop multi-game stack keeps 24px vertical separation', async ({ page }) => {
  await applyFixedClock(page)
  await seedGames(page, [
    {
      id: 'g1',
      name: 'Choices Matter',
      status: 'active',
      players: [{ name: 'Ari', avatar: 'monkey-face' }, { name: 'Jules', avatar: 'owl' }],
      lastUpdated: NOW,
      createdAt: NOW,
      resumable: true,
    },
    {
      id: 'g2',
      name: 'Weekend Sprint',
      status: 'active',
      players: [{ name: 'Riley', avatar: 'panda' }, { name: 'Casey', avatar: 'fox' }],
      lastUpdated: NOW - 60_000,
      createdAt: NOW - 60_000,
      resumable: true,
    },
    {
      id: 'g3',
      name: 'Friends Night',
      status: 'active',
      players: [{ name: 'Kai', avatar: 'frog' }, { name: 'Noor', avatar: 'penguin' }],
      lastUpdated: NOW - 120_000,
      createdAt: NOW - 120_000,
      resumable: true,
    },
  ])

  await page.goto('/')

  const cards = page.locator('.game-card')
  await expect(cards).toHaveCount(3)

  const first = await cards.nth(0).boundingBox()
  const second = await cards.nth(1).boundingBox()
  expect(first).not.toBeNull()
  expect(second).not.toBeNull()

  const verticalGap = second.y - (first.y + first.height)
  expect(verticalGap).toBeGreaterThanOrEqual(24)

  await assertScreenshot(page, 'home-multi-desktop.png')
})
