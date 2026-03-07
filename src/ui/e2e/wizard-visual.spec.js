import { expect, test } from '@playwright/test'

const disableMotion = async (page) => {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        caret-color: transparent !important;
        transition: none !important;
      }
    `,
  })
}

const completePlayer = async (page, { name, avatar, city, track, job }) => {
  await page.getByLabel('Player Name:').fill(name)
  if (avatar) {
    await page.getByRole('button', { name: `Choose ${avatar} persona` }).click()
  }
  await page.getByRole('button', { name: 'Next' }).click()
  if (city) {
    await page.getByRole('button', { name: new RegExp(city, 'i') }).click()
  }
  await page.getByRole('button', { name: 'Next' }).click()
  if (track) {
    await page.getByRole('button', { name: new RegExp(track, 'i') }).first().click()
  }
  await page.getByRole('button', { name: 'Next' }).click()
  if (job) {
    await page.getByRole('button', { name: new RegExp(job, 'i') }).first().click()
  }
  await page.getByRole('button', { name: 'Next' }).click()
}

test('captures the six desktop wizard steps', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await disableMotion(page)

  await page.getByRole('button', { name: 'New Game' }).click()
  await page.getByLabel('Game Name:').fill('Choices Matter')
  await expect(page).toHaveScreenshot('wizard-step-1-game-name.png')

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByLabel('Player Name:').fill('Jack')
  await page.getByRole('button', { name: 'Choose Robot persona' }).click()
  await expect(page).toHaveScreenshot('wizard-step-2-player.png')

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: /Denver/i }).click()
  await expect(page).toHaveScreenshot('wizard-step-3-city.png')

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: /Trades Track/i }).first().click()
  await expect(page).toHaveScreenshot('wizard-step-4-track.png')

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: /Electrician/i }).first().click()
  await expect(page).toHaveScreenshot('wizard-step-5-job.png')

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: '+ New Player' }).click()
  await completePlayer(page, {
    name: 'Mia',
    avatar: 'Cat',
    city: 'San Francisco',
    track: 'Degree Track',
    job: 'Dental Hygienist',
  })
  await page.getByRole('button', { name: '+ New Player' }).click()
  await completePlayer(page, {
    name: 'Mike',
    avatar: 'Rocket',
    city: 'Tonopah',
    track: 'Self-Taught Track',
    job: 'Mechanic',
  })

  await expect(page).toHaveScreenshot('wizard-step-6-summary.png')
})
