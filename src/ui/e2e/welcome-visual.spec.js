import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const STORAGE_KEY = 'ffthh-game-of-life.games'
const NOW = 1_760_000_000_000

const seedGames = async (page, games) => {
  await page.addInitScript(
    ({ key, payload, now }) => {
      Date.now = () => now
      window.localStorage.setItem(key, JSON.stringify(payload))
    },
    { key: STORAGE_KEY, payload: games, now: NOW },
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

test('direct /games/:id/play renders welcome first and lets begin returns home', async ({ page }) => {
  await seedGames(page, [
    {
      id: 'welcome-1',
      name: 'Choices Matter',
      status: 'active',
      players: [{ name: 'Ari', avatar: 'monkey-face', careerTrack: 'Degree Track' }],
      lastUpdated: NOW,
      createdAt: NOW,
      resumable: true,
    },
  ])

  await page.goto('/games/welcome-1/play')

  await expect(page.getByRole('heading', { level: 2, name: 'Welcome to Life!' })).toBeVisible()
  await assertScreenshot(page, 'welcome-desktop.png')

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible()
})

test('resume from home opens welcome first', async ({ page }) => {
  await seedGames(page, [
    {
      id: 'welcome-2',
      name: 'Choices Matter',
      status: 'active',
      players: [
        { name: 'Ari', avatar: 'monkey-face', careerTrack: 'Degree Track' },
        { name: 'Jules', avatar: 'owl', careerTrack: 'Creator Track' },
      ],
      lastUpdated: NOW,
      createdAt: NOW,
      resumable: true,
    },
  ])

  await page.goto('/')

  await page.getByRole('button', { name: 'Resume' }).click()
  await expect(page).toHaveURL('/games/welcome-2/play')
  await expect(page.getByRole('heading', { level: 2, name: 'Welcome to Life!' })).toBeVisible()
})
