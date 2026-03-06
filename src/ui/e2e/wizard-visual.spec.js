import { expect, test } from '@playwright/test'
import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const previewUrl = 'http://127.0.0.1:4173/'
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let previewServer = null

const isPortOpen = (port) =>
  new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' })
    socket.on('connect', () => {
      socket.end()
      resolve(true)
    })
    socket.on('error', () => resolve(false))
  })

const waitForPort = async (port) => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (await isPortOpen(port)) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Timed out waiting for preview server on port ${port}`)
}

test.beforeAll(async () => {
  const isRunning = await isPortOpen(4173)
  if (isRunning) {
    return
  }

  previewServer = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], {
    cwd: projectRoot,
    stdio: 'ignore',
  })

  await waitForPort(4173)
})

test.afterAll(() => {
  if (previewServer) {
    previewServer.kill('SIGTERM')
  }
})

const disableMotion = async (page) => {
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

const openWizard = async (page) => {
  await page.goto(previewUrl)
  await page.evaluate(() => {
    window.localStorage.clear()
    window.Date.now = () => 1760000000000
  })
  await page.reload()
  await disableMotion(page)
  await page.getByRole('button', { name: 'New Game' }).click()
  await expect(page.getByText('New Player Setup')).toBeVisible()
}

const advanceToStepTwo = async (page) => {
  await page.getByLabel('Player Name:').fill('Alex')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByText('New Player Setup - Pick City')).toBeVisible()
}

const advanceToStepThree = async (page) => {
  await advanceToStepTwo(page)
  await page.getByRole('button', { name: 'Denver' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByText('New Player Setup - Education Track')).toBeVisible()
}

const advanceToStepFour = async (page) => {
  await advanceToStepThree(page)
  await page.getByRole('button', { name: /Trades Track/i }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByText('New Player Setup - Pick a Career')).toBeVisible()
}

const advanceToSummary = async (page, name = 'Alex') => {
  await advanceToStepFour(page)
  await page.getByRole('button', { name: 'Electrician' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByText('New Game - Summary')).toBeVisible()
  await expect(page.getByText(name)).toBeVisible()
}

const snapshotPath = (fileName) => `__snapshots__/wizard-visual.spec.js-snapshots/${fileName}`

test.describe('wizard visuals', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('step 1 open state', async ({ page }) => {
    await openWizard(page)
    await expect(page.locator('.wizard-shell')).toHaveScreenshot(snapshotPath('wizard-step-1.png'))
  })

  test('step 2 with Denver selected', async ({ page }) => {
    await openWizard(page)
    await advanceToStepTwo(page)
    await page.getByRole('button', { name: 'Denver' }).click()
    await expect(page.locator('.wizard-shell')).toHaveScreenshot(snapshotPath('wizard-step-2.png'))
  })

  test('step 3 with Trades Track selected', async ({ page }) => {
    await openWizard(page)
    await advanceToStepThree(page)
    await page.getByRole('button', { name: /Trades Track/i }).click()
    await expect(page.locator('.wizard-shell')).toHaveScreenshot(snapshotPath('wizard-step-3.png'))
  })

  test('step 4 with Electrician selected', async ({ page }) => {
    await openWizard(page)
    await advanceToStepFour(page)
    await page.getByRole('button', { name: 'Electrician' }).click()
    await expect(page.locator('.wizard-shell')).toHaveScreenshot(snapshotPath('wizard-step-4.png'))
  })

  test('step 5 summary state', async ({ page }) => {
    await openWizard(page)
    await advanceToSummary(page)
    await page.getByRole('button', { name: '+ New Player' }).click()
    await page.getByLabel('Player Name:').fill('Blair')
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Tonopah, NV' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.locator('.wizard-choice-card-track').first().click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.locator('.wizard-choice-card-job').first().click()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.locator('.wizard-shell')).toHaveScreenshot(snapshotPath('wizard-step-5.png'))
  })
})
