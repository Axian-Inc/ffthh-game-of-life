import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const storageKey = 'ffthh-game-of-life.games'
const snapshotDir = path.resolve(process.cwd(), 'src/ui/e2e/__snapshots__')
const frozenNow = Date.UTC(2026, 2, 7, 12, 0, 0)

const seededGames = [
  {
    id: 'choices-matter',
    name: 'Choices Matter',
    status: 'active',
    resumable: true,
    lastUpdated: frozenNow,
    createdAt: frozenNow,
    players: [
      { id: 'p1', name: 'Jules', avatar: 'monkey-face', careerTrack: 'Degree Track' },
      { id: 'p2', name: 'Seth', avatar: 'owl', careerTrack: 'Trades Track' },
      { id: 'p3', name: 'Ari', avatar: 'koala', careerTrack: 'Creator Track' },
      { id: 'p4', name: 'Nova', avatar: 'panda', careerTrack: 'Degree Track' },
    ],
  },
]

const seedLocalGames = async (page, games = seededGames) => {
  await page.addInitScript(
    ({ key, seeded, now }) => {
      Date.now = () => now
      window.localStorage.clear()
      window.localStorage.setItem(key, JSON.stringify(seeded))
    },
    { key: storageKey, seeded: games, now: frozenNow },
  )
}

const waitForWelcome = async (page) => {
  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

const assertOwnedScreenshot = async (page, snapshotName, testInfo) => {
  const actual = await page.screenshot({
    animations: 'disabled',
    caret: 'hide',
  })
  const snapshotPath = path.join(snapshotDir, snapshotName)

  if (testInfo.config.updateSnapshots !== 'none' || !fs.existsSync(snapshotPath)) {
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true })
    fs.writeFileSync(snapshotPath, actual)
    return
  }

  const expected = fs.readFileSync(snapshotPath)
  if (expected.equals(actual)) {
    return
  }

  const actualPath = testInfo.outputPath(snapshotName)
  fs.writeFileSync(actualPath, actual)
  expect(actual.equals(expected), `Screenshot mismatch. Actual written to ${actualPath}`).toBe(true)
}

test('resume opens the welcome page and the CTA returns home', async ({ page }, testInfo) => {
  await seedLocalGames(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Resume' }).click()

  await waitForWelcome(page)
  await expect(page.getByText(/Game board coming soon/i)).toHaveCount(0)
  await assertOwnedScreenshot(page, 'welcome-page.png', testInfo)

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Game of LIFE' })).toBeVisible()
})

test('starting a new game lands on welcome before any placeholder board', async ({ page }) => {
  await seedLocalGames(page)
  await page.goto('/')

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.locator('#game-name').fill('Fresh Start')
  await page.getByPlaceholder('Player nickname').fill('Alex')
  await page.getByRole('button', { name: 'Add Player' }).click()
  await page.getByRole('button', { name: /Start Game with/i }).click()

  await expect(page.getByRole('heading', { name: 'Choose a career path' })).toBeVisible()
  await page.getByRole('button', { name: /Degree Track/i }).click()
  await page.getByRole('button', { name: 'Start Game' }).click()

  await waitForWelcome(page)
  await expect(page).toHaveURL(/\/games\/.+\/play$/)
  await expect(page.getByText(/Game board coming soon/i)).toHaveCount(0)
})
