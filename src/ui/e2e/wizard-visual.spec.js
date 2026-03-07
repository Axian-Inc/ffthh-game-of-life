import { expect, test } from '@playwright/test'

const disableMotion = async (page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition-duration: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        caret-color: transparent !important;
      }
    `,
  })
}

test('wizard desktop six-step visuals', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await disableMotion(page)

  await page.getByRole('button', { name: 'New Game' }).click()
  await expect(page.locator('.wizard-shell')).toHaveScreenshot('wizard-step-1.png')

  await page.locator('#game-name').fill('Choices Matter')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.locator('.wizard-shell')).toHaveScreenshot('wizard-step-2.png')

  await page.locator('#player-name').fill('Jack')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.locator('.wizard-shell')).toHaveScreenshot('wizard-step-3.png')

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.locator('.wizard-shell')).toHaveScreenshot('wizard-step-4.png')

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.locator('.wizard-shell')).toHaveScreenshot('wizard-step-5.png')

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.locator('.wizard-shell')).toHaveScreenshot('wizard-step-6.png')
})
