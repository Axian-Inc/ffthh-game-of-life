import { expect, test } from '@playwright/test'

const disableAnimations = async (page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  })
}

const openWizard = async (page) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'New Game' }).click()
  await disableAnimations(page)
}

test.describe('wizard desktop visuals', () => {
  test('matches all six steps', async ({ page }) => {
    await openWizard(page)

    await expect(page.locator('.modal-overlay')).toHaveScreenshot('wizard-step-1.png')

    await page.getByLabel('Game Name:').fill('Choices Matter')
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.locator('.modal-overlay')).toHaveScreenshot('wizard-step-2.png')

    await page.getByLabel('Player Name:').fill('Ari')
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.locator('.modal-overlay')).toHaveScreenshot('wizard-step-3.png')

    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.locator('.modal-overlay')).toHaveScreenshot('wizard-step-4.png')

    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.locator('.modal-overlay')).toHaveScreenshot('wizard-step-5.png')

    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: '+ New Player' }).click()
    await page.getByLabel('Player Name:').fill('Mia')
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.locator('.modal-overlay')).toHaveScreenshot('wizard-step-6.png')
  })
})
