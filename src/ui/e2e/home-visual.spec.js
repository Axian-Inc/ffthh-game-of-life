import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const storageKey = 'ffthh-game-of-life.games'
const snapshotDir = path.resolve(process.cwd(), 'src/ui/e2e/__snapshots__')
const frozenNow = Date.UTC(2026, 2, 7, 12, 0, 0)

const buildGame = ({ id, name, status = 'active', lastUpdated, players }) => ({
  id,
  name,
  status,
  lastUpdated,
  createdAt: lastUpdated,
  resumable: true,
  players,
})

const setLocalGames = async (page, games) => {
  await page.addInitScript(
    ({ key, seededGames, now }) => {
      Date.now = () => now
      window.localStorage.clear()
      window.localStorage.setItem(key, JSON.stringify(seededGames))
    },
    { key: storageKey, seededGames: games, now: frozenNow },
  )
}

const openHome = async (page) => {
  await page.goto('/')
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

test('home single-card baseline matches Screen 1', async ({ page }, testInfo) => {
  await setLocalGames(page, [
    buildGame({
      id: 'choices-matter',
      name: 'Choices Matter',
      lastUpdated: frozenNow,
      players: [
        { id: 'p1', name: 'Jules', avatar: 'monkey-face', careerTrack: 'Degree Track' },
        { id: 'p2', name: 'Seth', avatar: 'owl', careerTrack: 'Trades Track' },
        { id: 'p3', name: 'Ari', avatar: 'koala', careerTrack: 'Creator Track' },
        { id: 'p4', name: 'Nova', avatar: 'panda', careerTrack: 'Degree Track' },
      ],
    }),
  ])

  await openHome(page)

  await expect(page.getByRole('heading', { name: 'Game of LIFE' })).toBeVisible()
  await expect(page.getByText('Choices Matter')).toBeVisible()
  await assertOwnedScreenshot(page, 'home-single-card.png', testInfo)
})

test('home multi-game desktop stack keeps a 24px vertical gap', async ({ page }, testInfo) => {
  await setLocalGames(page, [
    buildGame({
      id: 'choices-matter',
      name: 'Choices Matter',
      lastUpdated: frozenNow,
      players: [
        { id: 'p1', name: 'Jules', avatar: 'monkey-face', careerTrack: 'Degree Track' },
        { id: 'p2', name: 'Seth', avatar: 'owl', careerTrack: 'Trades Track' },
        { id: 'p3', name: 'Ari', avatar: 'koala', careerTrack: 'Creator Track' },
        { id: 'p4', name: 'Nova', avatar: 'panda', careerTrack: 'Degree Track' },
      ],
    }),
    buildGame({
      id: 'next-turn',
      name: 'Next Turn',
      lastUpdated: frozenNow - 1000 * 60 * 3,
      players: [
        { id: 'p5', name: 'Avery', avatar: 'fox', careerTrack: 'Degree Track' },
        { id: 'p6', name: 'Mira', avatar: 'frog', careerTrack: 'Trades Track' },
      ],
    }),
    buildGame({
      id: 'steady-growth',
      name: 'Steady Growth',
      lastUpdated: frozenNow - 1000 * 60 * 10,
      players: [
        { id: 'p7', name: 'Luca', avatar: 'dog-face', careerTrack: 'Creator Track' },
        { id: 'p8', name: 'Eli', avatar: 'penguin', careerTrack: 'Degree Track' },
      ],
    }),
  ])

  await openHome(page)

  const cardBoxes = await page.locator('.game-card').evaluateAll((nodes) =>
    nodes.map((node) => {
      const { top, bottom } = node.getBoundingClientRect()
      return { top, bottom }
    }),
  )

  expect(cardBoxes).toHaveLength(3)
  for (let index = 1; index < cardBoxes.length; index += 1) {
    expect(cardBoxes[index].top - cardBoxes[index - 1].bottom).toBeGreaterThanOrEqual(24)
  }

  await assertOwnedScreenshot(page, 'home-multi-game-stack.png', testInfo)
})
