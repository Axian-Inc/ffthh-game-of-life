import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'ffthh-game-of-life.games'

const setStableRandom = async (page) => {
  await page.addInitScript(() => {
    Math.random = () => 0
  })
}

const setGames = async (page, games) => {
  await page.goto('/')
  await page.evaluate(
    ({ storageKey, records }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(records))
    },
    { storageKey: STORAGE_KEY, records: games },
  )
  await page.reload()
}

const buildPlayer = async (page, { avatar, city, track, career, nickname }) => {
  if (nickname) {
    await page.getByRole('textbox', { name: 'Nickname' }).fill(nickname)
  }
  await page.getByRole('button', { name: avatar }).click()
  await page.getByRole('button', { name: /^Next/i }).click()
  await page.getByRole('button', { name: new RegExp(city, 'i') }).click()
  await page.getByRole('button', { name: /^Next/i }).click()
  await page.getByRole('button', { name: new RegExp(track, 'i') }).click()
  await page.getByRole('button', { name: /^Next/i }).click()
  await page.getByRole('button', { name: new RegExp(career, 'i') }).click()
  await page.getByRole('button', { name: /^Next/i }).click()
}

test('window.life.status reports created game state after Start Game', async ({ page }) => {
  await setStableRandom(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'New Game' }).click()

  await expect(page.getByRole('textbox', { name: 'Game name' })).toHaveValue('Family Game Night')
  await expect
    .poll(() => page.evaluate(() => window.life.status().wizardDraft.gameName))
    .toBe('Family Game Night')

  await page.getByRole('textbox', { name: 'Game name' }).fill('Console Check')
  await page.getByRole('button', { name: /^Next/i }).click()
  await expect(page.getByRole('textbox', { name: 'Nickname' })).toHaveValue('Avery')

  await buildPlayer(page, {
    nickname: 'Ted',
    avatar: 'Fox',
    city: 'Denver',
    track: 'Self-Taught',
    career: 'Content Creator',
  })

  await page.getByRole('button', { name: /Add Player/i }).click()
  await expect(page.getByRole('textbox', { name: 'Nickname' })).toHaveValue('Nova')

  await buildPlayer(page, {
    nickname: 'Mia',
    avatar: 'Bear',
    city: 'New York City',
    track: 'Degree',
    career: 'Software Engineer',
  })

  await page.getByRole('button', { name: /Start Game/i }).click()
  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()

  let status = await page.evaluate(() => window.life.status())
  expect(status.entrySource).toBe('create')
  expect(status.playScreen).toBe('welcome')
  expect(status.activeGameId).toBeTruthy()
  expect(status.turnNumber).toBe(1)
  expect(status.activePlayerIndex).toBe(0)
  expect(status.activeGame.name).toBe('Console Check')
  expect(status.persistedGame.name).toBe('Console Check')
  expect(status.persistedGame.players).toHaveLength(2)
  expect(status.storageKey).toBe(STORAGE_KEY)

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page.getByRole('heading', { name: 'Modern Game of Life - Turn 1' })).toBeVisible()
  await expect(page.getByText("Ted's Turn")).toBeVisible()
  await page.getByRole('button', { name: 'Choose Action' }).click()

  status = await page.evaluate(() => window.life.status())
  expect(status.playScreen).toBe('turn')
  expect(status.turnNumber).toBe(1)
  expect(status.activePlayerIndex).toBe(1)
  expect(status.persistedGame.turnNumber).toBe(1)
  expect(status.persistedGame.activePlayerIndex).toBe(1)

  await expect(page.getByText("Mia's Turn")).toBeVisible()
  await page.getByRole('button', { name: 'Choose Action' }).click()

  status = await page.evaluate(() => window.life.status())
  expect(status.turnNumber).toBe(2)
  expect(status.activePlayerIndex).toBe(0)
  expect(status.persistedGame.turnNumber).toBe(2)
  expect(status.persistedGame.activePlayerIndex).toBe(0)
})

test('window.life.status reports resumed game state from the home screen', async ({ page }) => {
  const now = Date.now()
  const game = {
    id: 'resume-debug',
    name: 'Resume Debug',
    status: 'active',
    turnNumber: 4,
    activePlayerIndex: 1,
    players: [
      { id: 'player-1', name: 'Ari', avatar: 'panda' },
      { id: 'player-2', name: 'Jo', avatar: 'fox' },
    ],
    lastUpdated: now,
    createdAt: now,
    resumable: true,
  }

  await setGames(page, [game])
  await page.getByRole('button', { name: 'Resume', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Welcome to Life!' })).toBeVisible()

  let status = await page.evaluate(() => window.life.status())
  expect(status.entrySource).toBe('resume')
  expect(status.playScreen).toBe('welcome')
  expect(status.turnNumber).toBe(4)
  expect(status.activePlayerIndex).toBe(1)
  expect(status.activeGameId).toBe('resume-debug')
  expect(status.persistedGame.id).toBe('resume-debug')
  expect(status.persistedGame.players).toHaveLength(2)

  await page.getByRole('button', { name: "Let's Begin!" }).click()
  await expect(page.getByRole('heading', { name: 'Modern Game of Life - Turn 4' })).toBeVisible()
  await expect(page.getByText("Jo's Turn")).toBeVisible()
  await page.getByRole('button', { name: 'Choose Action' }).click()

  status = await page.evaluate(() => window.life.status())
  expect(status.playScreen).toBe('turn')
  expect(status.turnNumber).toBe(5)
  expect(status.activePlayerIndex).toBe(0)
  expect(status.persistedGame.turnNumber).toBe(5)
  expect(status.persistedGame.activePlayerIndex).toBe(0)
})
