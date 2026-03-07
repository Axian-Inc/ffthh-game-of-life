import { test, expect } from '@playwright/test'

test('create, start, reload, resume, and delete a two-player game', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.locator('#game-name').fill('Automation Draft')

  await page.getByPlaceholder('Player nickname').fill('Alex')
  await page.getByRole('button', { name: 'Add Player' }).click()

  await page.getByPlaceholder('Player nickname').fill('Sam')
  await page.getByRole('button', { name: 'Add Player' }).click()

  const beforeStart = await page.evaluate(() => {
    const data = JSON.parse(window.localStorage.getItem('ffthh-game-of-life.games') || '[]')
    return data.some((game) => game.name === 'Automation Draft')
  })
  expect(beforeStart).toBe(false)

  await page.getByRole('button', { name: /Start Game with 2 Players/ }).click()

  await expect(page.getByRole('heading', { name: 'Choose a career path' })).toBeVisible()
  await page.getByRole('button', { name: /Degree Track/i }).click()
  await page.getByRole('button', { name: /Trades Track/i }).click()
  await page.getByRole('button', { name: 'Start Game' }).click()

  await expect(page.getByRole('heading', { name: 'Automation Draft' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to home' }).click()
  await expect(page.getByRole('heading', { name: 'Automation Draft' })).toBeVisible()

  const savedPlayers = await page.evaluate(() => {
    const data = JSON.parse(window.localStorage.getItem('ffthh-game-of-life.games') || '[]')
    const game = data.find((entry) => entry.name === 'Automation Draft')
    return game?.players || []
  })
  expect(savedPlayers).toHaveLength(2)
  expect(savedPlayers[0]).toMatchObject({ name: 'Alex', careerTrack: 'Degree Track' })
  expect(savedPlayers[1]).toMatchObject({ name: 'Sam', careerTrack: 'Trades Track' })

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Automation Draft' })).toBeVisible()

  const automationCard = page.locator('.game-card', {
    has: page.getByRole('heading', { name: 'Automation Draft' }),
  })
  await automationCard.getByRole('button', { name: 'Resume' }).click()
  await expect(page.getByRole('heading', { name: 'Automation Draft' })).toBeVisible()

  await page.getByRole('button', { name: 'Back to home' }).click()
  await expect(page.getByRole('heading', { name: 'Automation Draft' })).toBeVisible()

  await page.getByRole('button', { name: 'Delete Automation Draft' }).click()
  await page.getByRole('button', { name: 'Delete game' }).click()
  await expect(page.getByText('Automation Draft')).toHaveCount(0)
})
