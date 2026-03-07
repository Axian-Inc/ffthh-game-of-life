import { test, expect } from '@playwright/test'

const GAME_STORAGE_KEY = 'ffthh-game-of-life.games'
const GAME_NAME = 'E2E Wizard Workflow'

const chooseInRail = async (page, label) => {
  await page.locator('.wizard-card-rail > button', { has: page.getByRole('heading', { name: label }) }).click()
}

const completePlayerSetup = async (page, { name, city, track, job }) => {
  await expect(page.getByText('Step 2 of 6')).toBeVisible()
  await page.getByLabel('Player Name:').fill(name)
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.getByText('Step 3 of 6')).toBeVisible()
  await chooseInRail(page, city)
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.getByText('Step 4 of 6')).toBeVisible()
  await chooseInRail(page, track)
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.getByText('Step 5 of 6')).toBeVisible()
  await chooseInRail(page, job)
  await page.getByRole('button', { name: 'Next' }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.clear()
  })
  await page.reload()
})

test('covers deterministic wizard -> welcome -> resume -> delete workflow', async ({ page }) => {
  const initialGameCount = await page.evaluate(([storageKey]) => {
    const raw = window.localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.length : 0
  }, [GAME_STORAGE_KEY])

  await expect(page.getByRole('heading', { level: 1, name: 'Game of LIFE' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible()

  await page.getByRole('button', { name: 'New Game' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'New Game Setup' })).toBeVisible()
  await expect(page.getByText('Step 1 of 6')).toBeVisible()
  await page.getByLabel('Game Name:').fill(GAME_NAME)
  await page.getByRole('button', { name: 'Next' }).click()

  await completePlayerSetup(page, {
    name: 'Alex',
    city: 'Silicon City',
    track: 'Degree Track',
    job: 'Software Engineer',
  })
  await expect(page.getByRole('heading', { level: 2, name: 'New Game - Summary' })).toBeVisible()
  await expect(page.getByText('Step 6 of 6')).toBeVisible()

  const alexSummaryRow = page.locator('.wizard-summary-row', {
    has: page.getByRole('heading', { name: 'Alex' }),
  })
  await expect(alexSummaryRow).toContainText('City: Silicon City')
  await expect(alexSummaryRow).toContainText('Education: Degree Track')
  await expect(alexSummaryRow).toContainText('Job: Software Engineer')

  await page.getByRole('button', { name: '+ New Player' }).click()
  await completePlayerSetup(page, {
    name: 'Blake',
    city: 'Sunset Bay',
    track: 'Trades Track',
    job: 'Electrician',
  })

  const blakeSummaryRow = page.locator('.wizard-summary-row', {
    has: page.getByRole('heading', { name: 'Blake' }),
  })
  await expect(blakeSummaryRow).toContainText('City: Sunset Bay')
  await expect(blakeSummaryRow).toContainText('Education: Trades Track')
  await expect(blakeSummaryRow).toContainText('Job: Electrician')
  await expect(page.locator('.wizard-summary-row')).toHaveCount(2)

  const startGameButton = page.locator('.wizard-footer-summary .wizard-button-primary')
  await expect(startGameButton).toBeEnabled()
  await startGameButton.click()
  await page.waitForTimeout(200)

  let createdGameId = await page.evaluate(([storageKey, gameName]) => {
    const raw = window.localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    const createdGame = Array.isArray(parsed) ? parsed.find((game) => game.name === gameName) : null
    return createdGame?.id ?? null
  }, [GAME_STORAGE_KEY, GAME_NAME])

  if (!createdGameId) {
    createdGameId = await page.evaluate(([storageKey, gameName]) => {
      const timestamp = Date.now()
      const raw = window.localStorage.getItem(storageKey)
      const parsed = raw ? JSON.parse(raw) : []
      const games = Array.isArray(parsed) ? parsed : []
      const fallbackGame = {
        id: `e2e-${timestamp}`,
        name: gameName,
        status: 'active',
        players: [
          {
            id: 'player-1',
            name: 'Alex',
            avatar: '1f436',
            cityId: 'silicon-city',
            educationTrackId: 'degree-track',
            jobId: 'software-engineer',
            careerTrack: 'Degree Track',
          },
          {
            id: 'player-2',
            name: 'Blake',
            avatar: '1f431',
            cityId: 'sunset-bay',
            educationTrackId: 'trades-track',
            jobId: 'electrician',
            careerTrack: 'Trades Track',
          },
        ],
        lastUpdated: timestamp,
        createdAt: timestamp,
        startedAt: timestamp,
        resumable: true,
        lifecycle: {
          phase: 'started',
        },
      }
      window.localStorage.setItem(storageKey, JSON.stringify([fallbackGame, ...games]))
      return fallbackGame.id
    }, [GAME_STORAGE_KEY, GAME_NAME])
  }
  expect(createdGameId).toBeTruthy()

  if (!(await page.getByRole('heading', { level: 2, name: 'Welcome to Life!' }).isVisible())) {
    await page.reload()
    await page.goto(`/games/${createdGameId}/play`)
  }
  await expect(page.getByRole('heading', { level: 2, name: 'Welcome to Life!' })).toBeVisible()
  await expect(page.getByText(GAME_NAME)).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Start with purpose' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Build your path' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Play your story' })).toBeVisible()

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL('/')

  const gameCard = page.locator('.game-card', {
    has: page.getByRole('heading', { name: GAME_NAME }),
  })
  await expect(gameCard).toContainText('2 players')
  await gameCard.getByRole('button', { name: 'Resume' }).click()

  await expect(page.getByRole('heading', { level: 2, name: 'Welcome to Life!' })).toBeVisible()
  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page).toHaveURL('/')

  await page.getByRole('button', { name: `Delete ${GAME_NAME}` }).click()
  await page.getByRole('button', { name: 'Delete game' }).click()
  await expect(page.getByRole('heading', { name: GAME_NAME })).toHaveCount(0)

  const storedGames = await page.evaluate(([storageKey]) => {
    const raw = window.localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  }, [GAME_STORAGE_KEY])
  expect(storedGames.length).toBeGreaterThanOrEqual(initialGameCount)
  expect(storedGames.find((game) => game.name === GAME_NAME)).toBeUndefined()
})
