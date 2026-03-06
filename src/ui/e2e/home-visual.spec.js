import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const STORAGE_KEY = 'ffthh-game-of-life.games'
const HOME_SNAPSHOT_URL = new URL('./__snapshots__/home-desktop.png', import.meta.url)

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

const setGames = async (page, games) => {
  await page.goto('/')
  await page.evaluate(
    ({ storageKey, value }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(value))
    },
    { storageKey: STORAGE_KEY, value: games },
  )
  await page.reload()
  await disableMotion(page)
}

test('home desktop baseline matches the single-card hub layout', async ({ page }) => {
  await setGames(page, [
    {
      id: 'choices-matter',
      name: 'Choices Matter',
      status: 'active',
      players: [
        { name: 'Ari', avatar: 'monkey-face' },
        { name: 'Jules', avatar: 'owl' },
        { name: 'Mira', avatar: 'fox' },
        { name: 'Seth', avatar: 'koala' },
      ],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      resumable: true,
    },
  ])

  const screenshot = await page.screenshot({ fullPage: true })
  expect(screenshot.equals(readFileSync(HOME_SNAPSHOT_URL))).toBe(true)
})

test('home stacks multiple resumable games with explicit vertical separation', async ({ page }) => {
  const now = Date.now()
  await setGames(page, [
    {
      id: 'game-1',
      name: 'Choices Matter',
      status: 'active',
      players: [
        { name: 'Ari', avatar: 'monkey-face' },
        { name: 'Jules', avatar: 'owl' },
        { name: 'Mira', avatar: 'fox' },
        { name: 'Seth', avatar: 'koala' },
      ],
      lastUpdated: now,
      createdAt: now,
      resumable: true,
    },
    {
      id: 'game-2',
      name: 'Another Turn',
      status: 'active',
      players: [
        { name: 'Quinn', avatar: 'penguin' },
        { name: 'Leo', avatar: 'frog' },
      ],
      lastUpdated: now - 1000,
      createdAt: now - 2000,
      resumable: true,
    },
  ])

  const cards = page.locator('.game-card')
  await expect(cards).toHaveCount(2)

  const styles = await page.locator('.game-items').evaluate((node) => {
    const computed = window.getComputedStyle(node)
    return {
      display: computed.display,
      rowGap: computed.rowGap,
      columnGap: computed.columnGap,
      gridTemplateColumns: computed.gridTemplateColumns,
    }
  })

  expect(styles.display).toBe('grid')
  expect(styles.rowGap).toBe('24px')
  expect(styles.columnGap).toBe('24px')
  expect(styles.gridTemplateColumns.trim().split(/\s+/)).toHaveLength(1)
})
