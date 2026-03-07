import { test, expect } from '@playwright/test'

const STORAGE_KEY = 'ffthh-game-of-life.games'

const configurePlayer = async (page, { name, city, education, job }) => {
  await page.getByLabel('Player Name:').fill(name)
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: city }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: education }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: job }).click()
  await page.getByRole('button', { name: 'Review Summary' }).click()
}

test('create, save, reload, and resume a game through the welcome page', async ({ page }) => {
  await page.addInitScript((key) => {
    if (!window.sessionStorage.getItem('ffthh-game-of-life.e2e-reset')) {
      window.localStorage.setItem(key, JSON.stringify([]))
      window.sessionStorage.setItem('ffthh-game-of-life.e2e-reset', '1')
    }
  }, STORAGE_KEY)
  await page.goto('/')

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.getByLabel('Game Name:').fill('Draft Family Quest')
  await page.getByRole('button', { name: 'Next' }).click()

  await configurePlayer(page, {
    name: 'Alex',
    city: 'Denver, CO',
    education: 'Degree Track',
    job: 'Veterinarian',
  })

  const summaryGameName = page.getByLabel('Game Name:')
  await summaryGameName.fill('Final Family Quest')
  await expect(page.getByRole('button', { name: 'Start Game' })).toBeDisabled()

  const gamesBeforeStart = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY)
  expect(gamesBeforeStart).toEqual([])

  await page.getByRole('button', { name: '+ New Player' }).click()
  await configurePlayer(page, {
    name: 'Blake',
    city: 'Portland, OR',
    education: 'Trades Track',
    job: 'Electrician',
  })

  await page.getByLabel('Game Name:').fill('Final Family Quest')
  await page.getByRole('button', { name: 'Start Game' }).click()

  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()
  await expect(page.getByText('Final Family Quest is ready to begin.')).toBeVisible()

  const savedGames = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY)
  expect(savedGames).toHaveLength(1)
  expect(savedGames[0].name).toBe('Final Family Quest')
  expect(savedGames[0].players).toHaveLength(2)
  expect(savedGames[0].players).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'Alex',
        cityId: 'denver-co',
        educationTrackId: 'degree-track',
        jobId: 'veterinarian',
        careerTrack: 'Health & Science',
      }),
      expect.objectContaining({
        name: 'Blake',
        cityId: 'portland-or',
        educationTrackId: 'trades-track',
        jobId: 'electrician',
        careerTrack: 'Skilled Trades',
      }),
    ]),
  )

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page.getByRole('heading', { name: 'Final Family Quest' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Final Family Quest' })).toBeVisible()

  await page.getByRole('button', { name: 'Resume' }).click()
  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()
  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page.getByRole('heading', { name: 'Final Family Quest' })).toBeVisible()
})
