import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const STORAGE_KEY = 'ffthh-game-of-life.games'
const WELCOME_SNAPSHOT_URL = new URL('./__snapshots__/welcome-desktop.png', import.meta.url)

const disableMotion = async (page) => {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  })
}

test('welcome desktop baseline matches the Wave 1 contract', async ({ page }) => {
  const now = Date.now()

  await page.goto('/')
  await page.evaluate(
    ({ storageKey, value }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(value))
    },
    {
      storageKey: STORAGE_KEY,
      value: [
        {
          id: 'welcome-game',
          name: 'Choices Matter',
          status: 'active',
          players: [
            { name: 'Ari', avatar: 'monkey-face', careerTrack: 'Degree Track' },
            { name: 'Jules', avatar: 'owl', careerTrack: 'Trades Track' },
          ],
          lastUpdated: now,
          createdAt: now,
          resumable: true,
        },
      ],
    },
  )
  await page.goto('/games/welcome-game/play')
  await disableMotion(page)

  const screenshot = await page.screenshot({ fullPage: true })
  expect(screenshot.equals(readFileSync(WELCOME_SNAPSHOT_URL))).toBe(true)
})

test("welcome CTA routes back to the landing page", async ({ page }) => {
  const now = Date.now()

  await page.goto('/')
  await page.evaluate(
    ({ storageKey, value }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(value))
    },
    {
      storageKey: STORAGE_KEY,
      value: [
        {
          id: 'welcome-game',
          name: 'Choices Matter',
          status: 'active',
          players: [
            { name: 'Ari', avatar: 'monkey-face', careerTrack: 'Degree Track' },
            { name: 'Jules', avatar: 'owl', careerTrack: 'Trades Track' },
          ],
          lastUpdated: now,
          createdAt: now,
          resumable: true,
        },
      ],
    },
  )
  await page.goto('/games/welcome-game/play')
  await disableMotion(page)

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Game of LIFE' })).toBeVisible()
})
