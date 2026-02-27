import { test, expect } from '@playwright/test'

test('create, configure, and delete a game', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.locator('#game-name').fill('Automation Game')
  await page.getByPlaceholder('Player nickname').fill('Alex')
  await page.getByRole('button', { name: 'Add Player' }).click()
  await page.getByRole('button', { name: /Start Game with/ }).click()

  await expect(page.getByRole('heading', { name: 'Choose a career path' })).toBeVisible()
  await page.getByRole('button', { name: /Degree Track/i }).click()
  await page.getByRole('button', { name: 'Start Game' }).click()

  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to home' }).click()

  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Automation Game' })).toBeVisible()

  await page.getByRole('button', { name: 'Delete Automation Game' }).click()
  await page.getByRole('button', { name: 'Delete game' }).click()
  await expect(page.getByText('Automation Game')).toHaveCount(0)
})
