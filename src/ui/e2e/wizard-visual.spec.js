import { expect, test } from '@playwright/test'

const disableAnimations = async (page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `,
  })
}

test('six-step wizard desktop visual baseline', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await disableAnimations(page)

  await page.getByRole('button', { name: 'New Game' }).click()

  const wizard = page.locator('.wizard-modal')

  await expect(wizard).toHaveScreenshot('wizard-step-1.png')

  await page.locator('#game-name').fill('Life Visual Test')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(wizard).toHaveScreenshot('wizard-step-2.png')

  await page.getByPlaceholder('Player nickname').fill('Alex')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(wizard).toHaveScreenshot('wizard-step-3.png')

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(wizard).toHaveScreenshot('wizard-step-4.png')

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(wizard).toHaveScreenshot('wizard-step-5.png')

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(wizard).toHaveScreenshot('wizard-step-6.png')
})
