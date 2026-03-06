import { test, expect } from '@playwright/test'

const WIZARD_VISUAL_SCENARIO = {
  gameName: 'Choices Matter',
  players: [
    {
      name: 'Jack',
      avatar: 'robot',
      cityId: 'denver',
      educationTrackId: 'trades-track',
      jobId: 'electrician',
    },
    {
      name: 'Mia',
      avatar: 'cat',
      cityId: 'san-francisco',
      educationTrackId: 'degree-track',
      jobId: 'dental-hygienist',
    },
    {
      name: 'Mike',
      avatar: 'rocket',
      cityId: 'tonopah',
      educationTrackId: 'degree-track',
      jobId: 'veterinarian',
    },
  ],
}

const disableAnimations = async (page) => {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  })
}

const captureStep = async (page, snapshotName) => {
  await page.mouse.move(0, 0)
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  })
  await expect(page.locator('.wizard-modal')).toHaveScreenshot(snapshotName)
}

const fillPlayer = async (page, player) => {
  await page.getByLabel('Player Name:').fill(player.name)
  await page.getByRole('button', { name: new RegExp(`^${player.avatar}$`, 'i') }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: new RegExp(`^${player.cityId === 'san-francisco' ? 'San Francisco' : player.cityId === 'denver' ? 'Denver' : 'Tonopah, NV'}$`) }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: new RegExp(`^${player.educationTrackId === 'trades-track' ? 'Trades Track' : 'Degree Track'}$`) }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page
    .getByRole('button', {
      name: new RegExp(
        `^${player.jobId === 'electrician' ? 'Electrician' : player.jobId === 'dental-hygienist' ? 'Dental Hygienist' : 'Veterinarian'}$`,
      ),
    })
    .click()
  await page.getByRole('button', { name: 'Next' }).click()
}

test.describe('wizard visuals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await disableAnimations(page)
    await page.getByRole('button', { name: 'New Game' }).click()
  })

  test('captures all six desktop steps', async ({ page }) => {
    await captureStep(page, 'wizard-step-1-desktop.png')

    await page.getByLabel('Game Name:').fill(WIZARD_VISUAL_SCENARIO.gameName)
    await page.getByRole('button', { name: 'Next' }).click()
    await captureStep(page, 'wizard-step-2-desktop.png')

    await page.getByLabel('Player Name:').fill(WIZARD_VISUAL_SCENARIO.players[0].name)
    await page.getByRole('button', { name: 'Robot' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Denver' }).click()
    await captureStep(page, 'wizard-step-3-desktop.png')

    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Trades Track' }).click()
    await captureStep(page, 'wizard-step-4-desktop.png')

    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Electrician' }).click()
    await captureStep(page, 'wizard-step-5-desktop.png')

    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: '+ New Player' }).click()
    await fillPlayer(page, WIZARD_VISUAL_SCENARIO.players[1])
    await page.getByRole('button', { name: '+ New Player' }).click()
    await fillPlayer(page, WIZARD_VISUAL_SCENARIO.players[2])
    await captureStep(page, 'wizard-step-6-desktop.png')
  })
})
