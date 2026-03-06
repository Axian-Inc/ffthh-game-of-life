import { test, expect } from '@playwright/test'

test('create, configure, and delete a game', async ({ page }) => {
  const storageKey = 'ffthh-game-of-life.games'

  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.locator('#game-name').fill('Automation Game')
  await page.getByPlaceholder('Player nickname').fill('Alex')
  await page.getByRole('button', { name: 'Add Player' }).click()
  await expect(page.getByRole('button', { name: /Start Game with 1 Player/i })).toBeDisabled()

  await page.getByPlaceholder('Player nickname').fill('Bailey')
  await page.getByRole('button', { name: 'Add Player' }).click()
  await page.getByRole('button', { name: /Start Game with 2 Players/i }).click()

  const existsBeforeFinalStart = await page.evaluate(
    ({ key, name }) => {
      const games = JSON.parse(window.localStorage.getItem(key) || '[]')
      return games.some((game) => game.name === name)
    },
    { key: storageKey, name: 'Automation Game' },
  )
  expect(existsBeforeFinalStart).toBe(false)

  await expect(page.getByRole('heading', { name: 'Choose a career path' })).toBeVisible()
  await page.getByRole('button', { name: /Degree Track/i }).click()
  await page.getByRole('button', { name: /Trades Track/i }).click()
  await page.getByRole('button', { name: 'Start Game' }).click()

  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()

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

  await page.getByRole('button', { name: 'Back to home' }).click()

  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()

  await page.getByRole('button', { name: 'Delete Automation Game' }).click()
  await page.getByRole('button', { name: 'Delete game' }).click()
  await expect(page.getByText('Automation Game')).toHaveCount(0)
})
