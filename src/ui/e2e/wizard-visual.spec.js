import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'ffthh-game-of-life.games'

const disableMotion = async (page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
    `,
  })
}

test('wizard desktop visuals remain stable across six setup steps', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((storageKey) => {
    window.localStorage.clear()
    window.localStorage.setItem(storageKey, JSON.stringify([]))
  }, STORAGE_KEY)
  await page.reload()
  await disableMotion(page)

  await page.getByRole('button', { name: 'New Game' }).click()

  await expect(page.getByRole('heading', { name: 'New Game Setup' })).toBeVisible()
  await expect(page).toHaveScreenshot('wizard-step-1.png', { fullPage: false })

  await page.getByLabel('Game Name:').fill('Wave 1 Visual Contract')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByLabel('Player Name:').fill('Player One')
  await page.getByRole('button', { name: '+ Add Player' }).click()
  await expect(page.getByRole('heading', { name: 'New Player Setup' })).toBeVisible()
  await expect(page).toHaveScreenshot('wizard-step-2.png', { fullPage: false })

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'San Francisco, CA' }).click()
  await expect(page).toHaveScreenshot('wizard-step-3.png', { fullPage: false })

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'Degree Track' }).click()
  await expect(page).toHaveScreenshot('wizard-step-4.png', { fullPage: false })

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'Software Engineer' }).click()
  await expect(page).toHaveScreenshot('wizard-step-5.png', { fullPage: false })

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: '+ New Player' }).click()
  await page.getByLabel('Player Name:').fill('Player Two')
  await page.getByRole('button', { name: '+ Add Player' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'Austin, TX' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'Trades Track' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('radio', { name: 'Electrician' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('heading', { name: 'New Game - Summary' })).toBeVisible()
  await expect(page).toHaveScreenshot('wizard-step-6.png', { fullPage: false })
})
