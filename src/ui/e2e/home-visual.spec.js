import { expect, test } from '@playwright/test'

const storageKey = 'ffthh-game-of-life.games'

const disableAnimations = async (page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `,
  })
}

const setGames = async (page, games) => {
  await page.addInitScript(
    ({ key, seededGames }) => {
      window.localStorage.setItem(key, JSON.stringify(seededGames))
    },
    { key: storageKey, seededGames: games },
  )
}

const createGame = ({ id, name, players, minutesAgo = 0 }) => {
  const now = Date.now()
  return {
    id,
    name,
    status: 'active',
    players,
    lastUpdated: now - minutesAgo * 60 * 1000,
    createdAt: now - minutesAgo * 60 * 1000,
    resumable: true,
  }
}

test('home desktop visual baseline matches screen 1', async ({ page }) => {
  await setGames(page, [
    createGame({
      id: 'choices-matter',
      name: 'Choices Matter',
      players: [
        { name: 'Jules', avatar: 'monkey-face' },
        { name: 'Seth', avatar: 'owl' },
        { name: 'Ari', avatar: 'koala' },
        { name: 'Mira', avatar: 'tiger-face' },
      ],
      minutesAgo: 0,
    }),
  ])

  await page.goto('/')
  await disableAnimations(page)

  await expect(page.getByRole('heading', { level: 1, name: 'Game of LIFE' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Choices Matter' })).toBeVisible()
  await expect(page.getByText('4 players')).toBeVisible()
  await expect(page.getByText('just now')).toBeVisible()
  await expect(page.getByText('ACTIVE')).toBeVisible()
  await expect(page).toHaveScreenshot('home-visual.png')
})

test('home desktop multi-game cards stay in one column with 24px spacing', async ({ page }) => {
  await setGames(page, [
    createGame({
      id: 'choices-matter',
      name: 'Choices Matter',
      players: [
        { name: 'Jules', avatar: 'monkey-face' },
        { name: 'Seth', avatar: 'owl' },
        { name: 'Ari', avatar: 'koala' },
        { name: 'Mira', avatar: 'tiger-face' },
      ],
      minutesAgo: 0,
    }),
    createGame({
      id: 'steady-steps',
      name: 'Steady Steps',
      players: [
        { name: 'Noor', avatar: 'fox' },
        { name: 'Kai', avatar: 'panda' },
        { name: 'Eli', avatar: 'penguin' },
        { name: 'Vera', avatar: 'frog' },
      ],
      minutesAgo: 8,
    }),
    createGame({
      id: 'future-builders',
      name: 'Future Builders',
      players: [
        { name: 'Ira', avatar: 'cat' },
        { name: 'Zoe', avatar: 'dog-face' },
        { name: 'Liam', avatar: 'eagle' },
        { name: 'Mina', avatar: 'rabbit' },
      ],
      minutesAgo: 13,
    }),
  ])

  await page.goto('/')
  await disableAnimations(page)

  const cards = page.locator('.game-card')
  await expect(cards).toHaveCount(3)

  const first = await cards.nth(0).boundingBox()
  const second = await cards.nth(1).boundingBox()
  const third = await cards.nth(2).boundingBox()

  expect(first).not.toBeNull()
  expect(second).not.toBeNull()
  expect(third).not.toBeNull()

  const firstGap = Math.round(second.y - (first.y + first.height))
  const secondGap = Math.round(third.y - (second.y + second.height))
  expect(firstGap).toBe(24)
  expect(secondGap).toBe(24)
  expect(Math.round(first.x)).toBe(Math.round(second.x))
  expect(Math.round(second.x)).toBe(Math.round(third.x))
  await expect(page).toHaveScreenshot('home-multi-game-visual.png')
})
