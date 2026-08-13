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

const setStableRandom = async (page) => {
  await page.addInitScript(() => {
    Math.random = () => 0
  })
}

const buildSinglePlayerSummary = async (page) => {
  await setStableRandom(page)
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
  await setStableRandom(page)
  await page.goto('/')
  await disableAnimations(page)
  await page.getByRole('button', { name: 'New Game' }).click()

  await expect(page.getByRole('heading', { name: 'Name Your Game' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Game name' })).toHaveValue('Family Game Night')
  await expect(page.getByRole('button', { name: /^Next/i })).toBeEnabled()

  await expect(page).toHaveScreenshot('wizard-game-name-modal.png', visualSnapshotOptions)
})

test('wizard choice steps match their unselected baselines', async ({ page }) => {
  await setStableRandom(page)
  await page.goto('/')
  await disableAnimations(page)
  await page.getByRole('button', { name: 'New Game' }).click()
  await page.getByRole('button', { name: /^Next/i }).click()

  await page.getByRole('textbox', { name: 'Nickname' }).fill('Ted')
  await expect(page.getByRole('heading', { name: 'Player 1' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Next/i })).toBeDisabled()
  await expect(page).toHaveScreenshot('wizard-player-identity-no-avatar.png', visualSnapshotOptions)

  await page.getByRole('button', { name: 'Panda' }).click()
  await page.getByRole('button', { name: /^Next/i }).click()
  await expect(page.getByRole('heading', { name: 'Choose a City' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Next/i })).toBeDisabled()
  await expect(page).toHaveScreenshot('wizard-city-no-selection.png', visualSnapshotOptions)

  await page.getByRole('button', { name: /Suburbia/i }).click()
  await page.getByRole('button', { name: /^Next/i }).click()
  await expect(page.getByRole('heading', { name: 'Education Track' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Next/i })).toBeDisabled()
  await expect(page).toHaveScreenshot('wizard-education-no-selection.png', visualSnapshotOptions)

  await page.getByRole('button', { name: /Self-Taught/i }).click()
  await page.getByRole('button', { name: /^Next/i }).click()
  await expect(page.getByRole('heading', { name: 'Pick a Career' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Next/i })).toBeDisabled()
  await expect(page).toHaveScreenshot('wizard-career-no-selection.png', visualSnapshotOptions)
})

test('summary modal shows one-player state with add-player affordance', async ({ page }) => {
  await buildSinglePlayerSummary(page)
  await disableAnimations(page)

  await expect(page.getByRole('heading', { name: 'Ready to Play' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Start Game/i })).toBeDisabled()

  await expect(page).toHaveScreenshot('wizard-summary-single-player.png', visualSnapshotOptions)
})
