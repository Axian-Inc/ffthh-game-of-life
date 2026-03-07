import { test, expect } from '@playwright/test'

test('create flow persists on Start Game and keeps both players after reload/resume', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  const initialGameCount = await page.evaluate(() => {
    const raw = window.localStorage.getItem('ffthh-game-of-life.games')
    const games = raw ? JSON.parse(raw) : []
    return Array.isArray(games) ? games.length : 0
  })

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.locator('#game-name').fill('Automation Save Contract')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByPlaceholder('Player nickname').fill('Alex')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()

  const gameCountBeforeStart = await page.evaluate(() => {
    const raw = window.localStorage.getItem('ffthh-game-of-life.games')
    const games = raw ? JSON.parse(raw) : []
    return Array.isArray(games) ? games.length : 0
  })
  expect(gameCountBeforeStart).toBe(initialGameCount)

  await page.getByRole('button', { name: '+ New Player' }).click()
  await page.getByPlaceholder('Player nickname').fill('Blake')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: /Start Game with 2 Players/ }).click()

  const gameCountAfterWizardSubmit = await page.evaluate(() => {
    const raw = window.localStorage.getItem('ffthh-game-of-life.games')
    const games = raw ? JSON.parse(raw) : []
    return Array.isArray(games) ? games.length : 0
  })
  expect(gameCountAfterWizardSubmit).toBe(initialGameCount)

  await expect(page.getByRole('heading', { name: 'Choose a career path' })).toBeVisible()
  await page.getByRole('button', { name: /Degree Track/i }).click()
  await page.getByRole('button', { name: /Trades Track/i }).click()
  await page.getByRole('button', { name: 'Start Game' }).click()

  const gameCountAfterStart = await page.evaluate(() => {
    const raw = window.localStorage.getItem('ffthh-game-of-life.games')
    const games = raw ? JSON.parse(raw) : []
    return Array.isArray(games) ? games.length : 0
  })
  expect(gameCountAfterStart).toBe(initialGameCount + 1)

  const savedGame = await page.evaluate(() => {
    const raw = window.localStorage.getItem('ffthh-game-of-life.games')
    const games = raw ? JSON.parse(raw) : []
    return games.find((game) => game.name === 'Automation Save Contract')
  })
  expect(savedGame.players).toHaveLength(2)
  expect(savedGame.players[0].careerTrack).toBeTruthy()
  expect(savedGame.players[1].careerTrack).toBeTruthy()
  expect(savedGame.currentStep).toBe(0)

  await expect(page.getByRole('heading', { level: 2, name: 'Welcome to Life!' })).toBeVisible()
  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL('/')

  const gameCard = page.locator('.game-card', {
    has: page.getByRole('heading', { name: 'Automation Save Contract' }),
  })
  await expect(page.getByRole('heading', { name: 'Automation Save Contract' })).toBeVisible()
  await expect(gameCard.getByText('2 players')).toBeVisible()

  await page.reload()
  const gameCardAfterReload = page.locator('.game-card', {
    has: page.getByRole('heading', { name: 'Automation Save Contract' }),
  })
  await expect(page.getByRole('heading', { name: 'Automation Save Contract' })).toBeVisible()
  await expect(gameCardAfterReload.getByText('2 players')).toBeVisible()

  await gameCardAfterReload.getByRole('button', { name: 'Resume' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Welcome to Life!' })).toBeVisible()
  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL('/')

  await page.getByRole('button', { name: 'Delete Automation Save Contract' }).click()
  await page.getByRole('button', { name: 'Delete game' }).click()
  await expect(page.getByText('Automation Save Contract')).toHaveCount(0)
})
