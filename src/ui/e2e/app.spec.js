import { test, expect } from '@playwright/test'

const createPlayer = async (page, { name, avatar, city, track, job }) => {
  await page.getByLabel('Player Name:').fill(name)
  await page.getByRole('button', { name: avatar }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: city }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: track }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: job }).click()
  await page.getByRole('button', { name: 'Next' }).click()
}

test('create, configure, and delete a game', async ({ page }) => {
  const storageKey = 'ffthh-game-of-life.games'

  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.getByLabel('Game Name:').fill('Automation Game')
  await page.getByRole('button', { name: 'Next' }).click()

  await createPlayer(page, {
    name: 'Alex',
    avatar: 'Robot',
    city: 'Denver',
    track: 'Degree Track',
    job: 'Dental Hygienist',
  })

  const existsBeforeFinalStart = await page.evaluate(
    ({ key, name }) => {
      const games = JSON.parse(window.localStorage.getItem(key) || '[]')
      return games.some((game) => game.name === name)
    },
    { key: storageKey, name: 'Automation Game' },
  )
  expect(existsBeforeFinalStart).toBe(false)

  await expect(page.getByRole('button', { name: 'Start Game' })).toBeDisabled()
  await page.getByRole('button', { name: '+ New Player' }).click()
  await createPlayer(page, {
    name: 'Bailey',
    avatar: 'Cat',
    city: 'San Francisco',
    track: 'Trades Track',
    job: 'Electrician',
  })

  await page.getByRole('button', { name: 'Start Game' }).click()

  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()

  const savedGame = await page.evaluate(
    ({ key, name }) => {
      const games = JSON.parse(window.localStorage.getItem(key) || '[]')
      return games.find((game) => game.name === name) || null
    },
    { key: storageKey, name: 'Automation Game' },
  )
  expect(savedGame).toBeTruthy()
  expect(savedGame.players).toHaveLength(2)
  expect(savedGame.players.map((player) => player.name)).toEqual(['Alex', 'Bailey'])
  expect(savedGame.players.map((player) => player.careerTrack)).toEqual(['Degree Track', 'Trades Track'])

  await page.getByRole('button', { name: "Let's Begin!" }).click()

  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()

  await page.getByRole('button', { name: 'Delete Automation Game' }).click()
  await page.getByRole('button', { name: 'Delete game' }).click()
  await expect(page.getByText('Automation Game')).toHaveCount(0)
})
