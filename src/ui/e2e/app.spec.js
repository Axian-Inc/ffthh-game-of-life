import { test, expect } from '@playwright/test'

test('create, configure, reload, resume, and delete a two-player game', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.locator('#game-name').fill('Wave 1 Automation Game')
  await page.getByPlaceholder('Player nickname').fill('Alex')
  await page.getByRole('button', { name: 'Add Player' }).click()
  await page.getByPlaceholder('Player nickname').fill('Sam')
  await page.getByRole('button', { name: 'Add Player' }).click()
  await page.getByRole('button', { name: /Start Game with/ }).click()

  await expect(page.getByRole('heading', { name: 'Choose a career path' })).toBeVisible()
  await page.getByRole('button', { name: /Degree Track/i }).click()
  await page.getByRole('button', { name: /Trades Track/i }).click()
  await page.getByRole('button', { name: 'Start Game' }).click()

  await expect(page.getByRole('heading', { name: 'Wave 1 Automation Game' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to home' }).click()

  await expect(page.getByRole('heading', { name: 'Wave 1 Automation Game' })).toBeVisible()
  await expect(page.getByText('2 players').first()).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Wave 1 Automation Game' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Resume' }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Resume' }).first().click()
  await expect(page.getByRole('heading', { name: 'Wave 1 Automation Game' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to home' }).click()

  await page.getByRole('button', { name: 'Delete Wave 1 Automation Game' }).click()
  await page.getByRole('button', { name: 'Delete game' }).click()
  await expect(page.getByText('Wave 1 Automation Game')).toHaveCount(0)
})
