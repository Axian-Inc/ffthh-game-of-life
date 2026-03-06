import { test, expect } from '@playwright/test'

const addPlayer = async (page, name) => {
  await page.getByPlaceholder('Player nickname').fill(name)
  await page.getByRole('button', { name: 'Add Player' }).click()
}

test('persists only after final start and keeps the saved game resumable', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.locator('#game-name').fill('Automation Game')
  await addPlayer(page, 'Alex')
  await addPlayer(page, 'Blair')
  await page.getByRole('button', { name: /Start Game with 2 Players/ }).click()

  await expect(page.getByRole('heading', { name: 'Choose a career path' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to home' }).click()
  await expect(page.getByRole('heading', { name: 'Automation Game' })).toHaveCount(0)

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.locator('#game-name').fill('Automation Game')
  await addPlayer(page, 'Alex')
  await addPlayer(page, 'Blair')
  await page.getByRole('button', { name: /Start Game with 2 Players/ }).click()
  await page.getByRole('button', { name: /Degree Track/i }).click()
  await page.getByRole('button', { name: /Creator Track/i }).click()
  await page.getByRole('button', { name: 'Start Game' }).click()

  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to home' }).click()

  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()
  await expect(page.getByText(/^2 players$/).first()).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()

  const automationGameCard = page.locator('li', {
    has: page.getByRole('heading', { name: 'Automation Game' }),
  })
  await automationGameCard.getByRole('button', { name: 'Resume' }).click()
  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to home' }).click()

  await page.getByRole('button', { name: 'Delete Automation Game' }).click()
  await page.getByRole('button', { name: 'Delete game' }).click()
  await expect(page.getByText('Automation Game')).toHaveCount(0)
})
