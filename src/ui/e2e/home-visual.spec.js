import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const APP_STORAGE_KEY = 'ffthh-game-of-life.games'
const FIXED_NOW = Date.UTC(2026, 2, 6, 12, 0, 0)
const PREVIEW_PORT = 4173
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}/`
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UI_ROOT = path.resolve(__dirname, '..')
const SNAPSHOT_PATH = path.join(
  __dirname,
  '__snapshots__',
  'home-visual.spec.js-snapshots',
  'home-screen-1-linux.png',
)

let previewServer

const seededGames = [
  {
    id: 'choices-matter',
    name: 'Choices Matter',
    status: 'active',
    players: [
      { id: 'player-1', name: 'Ari', avatar: 'monkey-face' },
      { id: 'player-2', name: 'Kai', avatar: 'dog-face' },
      { id: 'player-3', name: 'June', avatar: 'cat-face' },
      { id: 'player-4', name: 'Noah', avatar: 'panda-face' },
    ],
    lastUpdated: FIXED_NOW,
    createdAt: FIXED_NOW,
    resumable: true,
  },
]

const isPortOpen = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port })
    socket.once('connect', () => {
      socket.end()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
  })

const waitForPreviewServer = async (port, timeoutMs = 15_000) => {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await isPortOpen(port)) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  throw new Error(`Timed out waiting for preview server on port ${port}`)
}

test.beforeAll(async () => {
  if (await isPortOpen(PREVIEW_PORT)) {
    return
  }

  previewServer = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT)], {
    cwd: UI_ROOT,
    env: { ...process.env },
    stdio: 'ignore',
  })

  await waitForPreviewServer(PREVIEW_PORT)
})

test.afterAll(async () => {
  if (!previewServer) {
    return
  }

  previewServer.kill('SIGTERM')
  await new Promise((resolve) => previewServer.once('exit', resolve))
  previewServer = undefined
})

test('home screen matches screen 1 baseline', async ({ page }) => {
  await page.addInitScript(
    ({ storageKey, games, now }) => {
      window.localStorage.clear()
      window.localStorage.setItem(storageKey, JSON.stringify(games))

      const RealDate = Date
      class MockDate extends RealDate {
        constructor(...args) {
          super(...(args.length === 0 ? [now] : args))
        }

        static now() {
          return now
        }
      }

      Object.setPrototypeOf(MockDate, RealDate)
      window.Date = MockDate
    },
    { storageKey: APP_STORAGE_KEY, games: seededGames, now: FIXED_NOW },
  )

  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto(PREVIEW_URL)

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

  await expect(page.getByText('Choices Matter')).toBeVisible()
  await expect(page.getByText('4 players')).toBeVisible()
  await expect(page.getByText('just now')).toBeVisible()
  await expect(page.getByText('ACTIVE')).toBeVisible()

  const screenshot = await page.screenshot({ fullPage: true })

  if (process.env.WRITE_HOME_VISUAL_BASELINE === '1') {
    fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true })
    fs.writeFileSync(SNAPSHOT_PATH, screenshot)
    return
  }

  expect(fs.existsSync(SNAPSHOT_PATH), `Missing screenshot baseline at ${SNAPSHOT_PATH}`).toBe(true)
  expect(screenshot).toEqual(fs.readFileSync(SNAPSHOT_PATH))
})
