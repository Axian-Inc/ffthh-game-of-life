import { test, expect } from '@playwright/test'

test('create, start, reload, resume, and delete a two-player game', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.locator('#wizard-game-name').fill('Automation Draft')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.locator('#wizard-player-name').fill('Alex')
  await page.getByRole('button', { name: '+ Add Player' }).click()

  await page.locator('#wizard-player-name').fill('Sam')
  await page.getByRole('button', { name: '+ Add Player' }).click()

  const beforeStart = await page.evaluate(() => {
    const data = JSON.parse(window.localStorage.getItem('ffthh-game-of-life.games') || '[]')
    return data.some((game) => game.name === 'Automation Draft')
  })
  expect(beforeStart).toBe(false)

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'San Francisco, CA' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'Degree Track' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'Software Engineer' }).click()
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByRole('button', { name: '+ New Player' }).click()
  await page.getByRole('button', { name: 'Alex', exact: true }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'Austin, TX' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'Trades Track' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'Electrician' }).click()
  await page.getByRole('button', { name: 'Next' }).click()

  await page.locator('#wizard-summary-game-name').fill('Final Family Night')
  await page.getByRole('button', { name: 'Start Game' }).click()

  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()
  await expect(page.getByText('Final Family Night')).toBeVisible()
  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL('/')

  const savedGame = await page.evaluate(() => {
    const data = JSON.parse(window.localStorage.getItem('ffthh-game-of-life.games') || '[]')
    return data[0] || null
  })
  expect(savedGame).not.toBeNull()
  const savedGameName = savedGame.name

  await page.reload()
  await expect(page.getByRole('heading', { name: savedGameName })).toBeVisible()

  const automationCard = page.locator('.game-card', {
    has: page.getByRole('heading', { name: savedGameName }),
  })
  await automationCard.getByRole('button', { name: 'Resume' }).click()
  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()
  await expect(page.getByText(savedGameName)).toBeVisible()

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page.getByRole('heading', { name: savedGameName })).toBeVisible()

  await page.getByRole('button', { name: `Delete ${savedGameName}` }).click()
  await page.getByRole('button', { name: 'Delete game' }).click()
  await expect(page.getByText(savedGameName)).toHaveCount(0)
})
