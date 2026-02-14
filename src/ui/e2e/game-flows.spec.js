import { test, expect } from '@playwright/test'

const seedGames = [
  {
    id: 1,
    name: 'Career Day',
    status: 'active',
    players: [
      { name: 'Avery', avatar: '🧩' },
      { name: 'Quinn', avatar: '⚡' },
    ],
    lastUpdated: 1700000000000,
    createdAt: 1700000000000,
    resumable: true,
  },
  {
    id: 2,
    name: 'Old Game',
    status: 'completed',
    players: [{ name: 'Riley', avatar: '🌿' }],
    lastUpdated: 1700000000000,
    createdAt: 1700000000000,
    resumable: false,
  },
]

const seedPage = async (page) => {
  await page.addInitScript((seed) => {
    window.__E2E_SEED__ = seed
  }, seedGames)
}

const attachConsoleLogs = (page) => {
  const logs = []
  page.on('console', (msg) => {
    logs.push(`[${msg.type()}] ${msg.text()}`)
  })
  return logs
}

let consoleLogs = []

test.beforeEach(async ({ page }) => {
  consoleLogs = attachConsoleLogs(page)
  await seedPage(page)
})

test.afterEach(async ({}, testInfo) => {
  await testInfo.attach('console.log', {
    body: consoleLogs.join('\n') || 'no console output',
    contentType: 'text/plain',
  })
})

test('create new game with career selection', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId('new-game-button').click()
  await expect(page.getByTestId('create-game-modal')).toBeVisible()

  await page.getByTestId('game-name-input').fill('Career Adventure')
  await page.getByTestId('career-path-select').selectOption('highlife')
  await expect(page.getByTestId('career-path-select')).toHaveValue('highlife')

  await page.getByTestId('player-name-input').fill('Ava')
  await page.getByTestId('add-player-button').click()

  await page.getByTestId('start-game-button').click()

  await expect(page.getByTestId('start-game-screen')).toBeVisible()
  await expect(page.getByText('Career Adventure')).toBeVisible()

  const rows = page.locator('.career-row')
  await rows
    .nth(0)
    .getByTestId('career-option')
    .filter({ hasText: 'College' })
    .click()
  await rows
    .nth(1)
    .getByTestId('career-option')
    .filter({ hasText: 'Trades' })
    .click()

  await page.getByTestId('start-game-continue').click()
  await expect(page.getByTestId('resume-game-modal')).toBeVisible()
  await page.getByRole('button', { name: 'Back to home' }).click()

  const newCard = page.locator('[data-game-name="Career Adventure"]')
  await expect(newCard).toBeVisible()
  await newCard.getByTestId('delete-game-button').click()
  await page.getByTestId('confirm-delete-button').click()
  await expect(newCard).toHaveCount(0)
})

test('resume game flow opens resume modal', async ({ page }) => {
  await page.goto('/')

  const resumeCard = page.locator('[data-game-name="Career Day"]')
  await resumeCard.getByTestId('resume-game-button').click()

  await expect(page.getByTestId('resume-game-modal')).toBeVisible()
  await expect(page.getByText('Resume Game')).toBeVisible()
})

test('delete game removes it from list', async ({ page }) => {
  await page.goto('/')

  const deleteCard = page.locator('[data-game-name="Old Game"]')
  await deleteCard.getByTestId('delete-game-button').click()
  await page.getByTestId('confirm-delete-button').click()

  await expect(deleteCard).toHaveCount(0)
})
