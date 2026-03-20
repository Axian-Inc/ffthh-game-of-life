import { expect, test } from '@playwright/test'

const visualSnapshotOptions = {
  maxDiffPixels: 6500,
}

const disableAnimations = async (page) => {
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;}',
  })
}

const buildSinglePlayerSummary = async (page) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'New Game' }).click()
  await page.getByRole('textbox', { name: 'Game name' }).fill('Game Name')
  await page.getByRole('button', { name: /^Next/i }).click()
  await page.getByRole('textbox', { name: 'Nickname' }).fill('Ted')
  await page.getByRole('button', { name: 'Panda' }).click()
  await page.getByRole('button', { name: /^Next/i }).click()
  await page.getByRole('button', { name: /Suburbia/i }).click()
  await page.getByRole('button', { name: /^Next/i }).click()
  await page.getByRole('button', { name: /Self-Taught/i }).click()
  await page.getByRole('button', { name: /^Next/i }).click()
  await page.getByRole('button', { name: /Content Creator/i }).click()
  await page.getByRole('button', { name: /^Next/i }).click()
}

test('new game modal matches the game-name step baseline', async ({ page }) => {
  await page.goto('/')
  await disableAnimations(page)
  await page.getByRole('button', { name: 'New Game' }).click()

  await expect(page.getByRole('heading', { name: 'Name Your Game' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Next/i })).toBeDisabled()

  await expect(page).toHaveScreenshot('wizard-game-name-modal.png', visualSnapshotOptions)
})

test('summary modal shows one-player state with add-player affordance', async ({ page }) => {
  await buildSinglePlayerSummary(page)
  await disableAnimations(page)

  await expect(page.getByRole('heading', { name: 'Ready to Play' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Start Game/i })).toBeDisabled()

  await expect(page).toHaveScreenshot('wizard-summary-single-player.png', visualSnapshotOptions)
})
