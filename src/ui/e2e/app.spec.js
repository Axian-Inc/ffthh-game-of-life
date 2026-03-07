import { test, expect } from '@playwright/test'

test('create, persist on start, reload, and resume keeps full setup players', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  const baselineGameCount = await page.evaluate(() => {
    const games = JSON.parse(window.localStorage.getItem('ffthh-game-of-life.games') || '[]')
    return games.length
  })

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.locator('#game-name').fill('Choices Matter Final')
  await page.getByPlaceholder('Player nickname').fill('Alex')
  await page.getByRole('button', { name: 'Add Player' }).click()
  await page.getByPlaceholder('Player nickname').fill('Jamie')
  await page.getByRole('button', { name: 'Add Player' }).click()

  await page.getByRole('button', { name: /Start Game with 2 Players/i }).click()

  await expect(page.getByRole('heading', { name: 'Choose a career path' })).toBeVisible()

  const countBeforeStart = await page.evaluate(() => JSON.parse(window.localStorage.getItem('ffthh-game-of-life.games') || '[]').length)
  expect(countBeforeStart).toBe(baselineGameCount)

  await page.getByRole('button', { name: /Degree Track/i }).click()
  await page.getByRole('button', { name: /Creator Track/i }).click()
  await page.getByRole('button', { name: 'Start Game' }).click()

  await expect(page.getByRole('heading', { name: 'Choices Matter Final' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to home' }).click()

  await expect(page.getByRole('heading', { name: 'Choices Matter Final' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Choices Matter Final' })).toBeVisible()

  await page.getByRole('button', { name: 'Resume' }).first().click()
  await expect(page.getByRole('heading', { name: 'Choices Matter Final' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to home' }).click()

  const savedGame = await page.evaluate(() => {
    const games = JSON.parse(window.localStorage.getItem('ffthh-game-of-life.games') || '[]')
    return games.find((game) => game.name === 'Choices Matter Final')
  })

  expect(savedGame).toBeTruthy()
  expect(savedGame.players).toHaveLength(2)
  expect(savedGame.players).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'Alex',
        cityId: expect.any(String),
        educationTrackId: expect.any(String),
        jobId: expect.any(String),
        careerTrack: 'Degree Track',
      }),
      expect.objectContaining({
        name: 'Jamie',
        cityId: expect.any(String),
        educationTrackId: expect.any(String),
        jobId: expect.any(String),
        careerTrack: 'Creator Track',
      }),
    ]),
  )

  await page.getByRole('button', { name: 'Delete Choices Matter Final' }).click()
  await page.getByRole('button', { name: 'Delete game' }).click()
  await expect(page.getByText('Choices Matter Final')).toHaveCount(0)
})
