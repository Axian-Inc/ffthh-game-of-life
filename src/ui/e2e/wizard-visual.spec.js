import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'ffthh-game-of-life.games'

test('wizard surface renders and can be captured for visual review', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((storageKey) => {
    window.localStorage.clear()
    window.localStorage.setItem(storageKey, JSON.stringify([]))
  }, STORAGE_KEY)
  await page.reload()

  await page.getByRole('button', { name: 'New Game' }).click()
  await expect(page.getByRole('heading', { name: 'New Game Setup' })).toBeVisible()

  await page.locator('#wizard-game-name').fill('Wave 1 Wizard Visual')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('heading', { name: 'New Player Setup' })).toBeVisible()

  const screenshot = await page.screenshot({ fullPage: true })
  expect(screenshot.length).toBeGreaterThan(10000)
})
