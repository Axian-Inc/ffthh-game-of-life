import { expect, test } from '@playwright/test'

const disableMotion = async (page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `,
  })
}

const openWizard = async (page) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await disableMotion(page)
  await page.getByRole('button', { name: 'New Game' }).click()
}

test('wizard desktop visuals for all six steps', async ({ page }) => {
  await openWizard(page)

  const wizard = page.locator('.wizard-modal')
  await expect(wizard).toHaveScreenshot('wizard-step-1.png')

  await page.getByLabel('Game Name:').fill('Choices Matter')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(wizard).toHaveScreenshot('wizard-step-2.png')

  await page.getByLabel('Player Name:').fill('Alex')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(wizard).toHaveScreenshot('wizard-step-3.png')

  await page.getByRole('button', { name: /San Francisco, CA/i }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(wizard).toHaveScreenshot('wizard-step-4.png')

  await page.getByRole('button', { name: /Degree Track/i }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(wizard).toHaveScreenshot('wizard-step-5.png')

  await page.getByRole('button', { name: /Software Engineer/i }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(wizard).toHaveScreenshot('wizard-step-6.png')
})
