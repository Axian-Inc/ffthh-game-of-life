import fs from 'node:fs'
import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'ffthh-game-of-life.games'
const readSnapshot = (name) => fs.readFileSync(new URL(`./__snapshots__/${name}`, import.meta.url))

const disableAnimations = async (page) => {
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

test('matches the Screen 7 welcome baseline', async ({ page }) => {
  await page.addInitScript((storageKey) => {
    const now = Date.now()
    window.localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'choices-matter',
          name: 'Choices Matter',
          status: 'active',
          players: [
            { id: 'p1', name: 'Ari', avatar: 'monkey-face', careerTrack: 'Degree Track' },
            { id: 'p2', name: 'Mira', avatar: 'frog', careerTrack: 'Trades Track' },
          ],
          lastUpdated: now,
          createdAt: now,
          resumable: true,
        },
      ]),
    )
  }, STORAGE_KEY)

  await page.goto('/games/choices-matter/play')
  await disableAnimations(page)

  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()
  await expect(page.getByRole('button', { name: "Let's Begin!" })).toBeVisible()
  await expect(page.getByText(/Game board coming soon/i)).toHaveCount(0)
  expect(await page.screenshot()).toEqual(readSnapshot('welcome-baseline-linux.png'))
})

test("returns to the landing page when Let's Begin! is clicked", async ({ page }) => {
  await page.addInitScript((storageKey) => {
    const now = Date.now()
    window.localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'choices-matter',
          name: 'Choices Matter',
          status: 'active',
          players: [
            { id: 'p1', name: 'Ari', avatar: 'monkey-face', careerTrack: 'Degree Track' },
            { id: 'p2', name: 'Mira', avatar: 'frog', careerTrack: 'Trades Track' },
          ],
          lastUpdated: now,
          createdAt: now,
          resumable: true,
        },
      ]),
    )
  }, STORAGE_KEY)

  await page.goto('/games/choices-matter/play')
  await disableAnimations(page)

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Game of LIFE' })).toBeVisible()
})
