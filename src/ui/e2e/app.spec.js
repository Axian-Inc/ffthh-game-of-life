import { test, expect } from '@playwright/test'

test('create, configure, reload, resume, and delete a two-player game', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: 'New Game' }).click({ force: true })
  await page.locator('#game-name').fill('Wave 1 Automation Game')
  await page.getByRole('button', { name: 'Next' }).click({ force: true })

  await page.getByLabel('Player Name:').fill('Alex')
  await page.getByRole('button', { name: 'Next' }).click({ force: true })
  await page.getByRole('button', { name: 'Next' }).click({ force: true })
  await page.getByRole('button', { name: 'Next' }).click({ force: true })
  await page.getByRole('button', { name: 'Next' }).click({ force: true })

  await page.getByRole('button', { name: '+ New Player' }).click({ force: true })
  await page.getByLabel('Player Name:').fill('Sam')
  await page.getByRole('button', { name: 'Next' }).click({ force: true })
  await page.getByRole('button', { name: 'Next' }).click({ force: true })
  await page.getByRole('button', { name: 'Next' }).click({ force: true })
  await page.getByRole('button', { name: 'Next' }).click({ force: true })
  await page.getByRole('button', { name: 'Start Game' }).click({ force: true })

  await expect(page.getByRole('heading', { level: 2, name: 'Choose a career path' })).toBeVisible()
  await page.getByRole('button', { name: /Degree Track/ }).click({ force: true })
  await page.getByRole('button', { name: /Trades Track/ }).click({ force: true })
  await page.getByRole('button', { name: 'Start Game' }).click({ force: true })

  await expect(page.getByRole('heading', { level: 2, name: 'Welcome to Life!' })).toBeVisible()
  await page.getByRole('button', { name: "Let's Begin!" }).click({ force: true })

  await expect(page.getByRole('heading', { name: 'Wave 1 Automation Game' })).toBeVisible()
  await expect(page.getByText('2 players').first()).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Wave 1 Automation Game' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Resume' }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Resume' }).first().click({ force: true })
  await expect(page.getByRole('heading', { level: 2, name: 'Welcome to Life!' })).toBeVisible()
  await page.getByRole('button', { name: "Let's Begin!" }).click({ force: true })

  await page.getByRole('button', { name: 'Delete Wave 1 Automation Game' }).click({ force: true })
  await page.getByRole('button', { name: 'Delete game' }).click({ force: true })
  await expect(page.getByText('Wave 1 Automation Game')).toHaveCount(0)
})
