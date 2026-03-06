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

const seedGames = async (page, games) => {
  await page.addInitScript(
    ({ storageKey, seededGames }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(seededGames))
    },
    { storageKey: STORAGE_KEY, seededGames: games },
  )
}

test('matches the Screen 1 home baseline', async ({ page }) => {
  const now = Date.now()
  await seedGames(page, [
    {
      id: 'choices-matter',
      name: 'Choices Matter',
      status: 'active',
      players: [
        { id: 'p1', name: 'Ari', avatar: 'monkey-face' },
        { id: 'p2', name: 'Mira', avatar: 'frog' },
        { id: 'p3', name: 'Noah', avatar: 'panda' },
        { id: 'p4', name: 'Sage', avatar: 'turtle' },
      ],
      lastUpdated: now,
      createdAt: now,
      resumable: true,
    },
  ])

  await page.goto('/')
  await disableAnimations(page)

  await expect(page.getByRole('heading', { name: 'Game of LIFE' })).toBeVisible()
  await expect(page.getByText('Choices Matter')).toBeVisible()
  expect(await page.screenshot()).toEqual(readSnapshot('home-baseline-linux.png'))
})

test('keeps multiple game cards in a single desktop column with visible separation', async ({ page }) => {
  const now = Date.now()
  await seedGames(page, [
    {
      id: 'choices-matter',
      name: 'Choices Matter',
      status: 'active',
      players: [
        { id: 'p1', name: 'Ari', avatar: 'monkey-face' },
        { id: 'p2', name: 'Mira', avatar: 'frog' },
        { id: 'p3', name: 'Noah', avatar: 'panda' },
        { id: 'p4', name: 'Sage', avatar: 'turtle' },
      ],
      lastUpdated: now,
      createdAt: now,
      resumable: true,
    },
    {
      id: 'fresh-start',
      name: 'Fresh Start',
      status: 'active',
      players: [
        { id: 'p5', name: 'Jules', avatar: 'fox' },
        { id: 'p6', name: 'Lena', avatar: 'cat-face' },
      ],
      lastUpdated: now - 25_000,
      createdAt: now - 60_000,
      resumable: true,
    },
    {
      id: 'next-turn',
      name: 'Next Turn',
      status: 'active',
      players: [
        { id: 'p7', name: 'Kai', avatar: 'penguin' },
        { id: 'p8', name: 'Vera', avatar: 'dog-face' },
        { id: 'p9', name: 'Rin', avatar: 'cow-face' },
      ],
      lastUpdated: now - 50_000,
      createdAt: now - 90_000,
      resumable: true,
    },
  ])

  await page.goto('/')
  await disableAnimations(page)

  const cards = page.locator('.game-card')
  await expect(cards).toHaveCount(3)

  const layout = await page.locator('.game-items').evaluate((element) => ({
    rowGap: getComputedStyle(element).rowGap,
  }))
  const itemOffsets = await page
    .locator('.game-items > li')
    .evaluateAll((items) => items.map((item) => item.offsetLeft))

  expect(layout.rowGap).toBe('24px')
  expect(new Set(itemOffsets).size).toBe(1)

  expect(await page.screenshot()).toEqual(readSnapshot('home-multi-game-linux.png'))
})
