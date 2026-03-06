import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from '@playwright/test'

const seededGame = {
  id: 'welcome-visual-game',
  name: 'Choices Matter',
  status: 'active',
  players: [
    {
      id: 'player-1',
      name: 'Ari',
      avatar: 'monkey-face',
      careerTrack: 'Degree Track',
    },
    {
      id: 'player-2',
      name: 'Jordan',
      avatar: 'panda',
      careerTrack: 'Trades Track',
    },
  ],
  lastUpdated: 1760000000000,
  createdAt: 1760000000000,
  resumable: true,
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const welcomeSnapshotPath = path.join(
  __dirname,
  '__snapshots__',
  'welcome-visual.spec.js-snapshots',
  'welcome-screen-linux.png',
)

test('renders the welcome screen before play content', async ({ page }) => {
  await page.addInitScript(({ game }) => {
    window.localStorage.clear()
    window.localStorage.setItem('ffthh-game-of-life.games', JSON.stringify([game]))
  }, { game: seededGame })

  await page.goto('/games/welcome-visual-game/play')

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

  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()
  await expect(page.getByText('Game board coming soon.')).toHaveCount(0)

  expect(fs.existsSync(welcomeSnapshotPath)).toBe(true)
  expect(await page.screenshot()).toEqual(fs.readFileSync(welcomeSnapshotPath))
})
