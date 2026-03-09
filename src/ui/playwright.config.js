import { defineConfig } from '@playwright/test'
import fs from 'node:fs'

const baseURL = 'http://127.0.0.1:4173'
const systemChromium = '/usr/bin/chromium'
const resolvedChromium =
  process.env.CHROME_BIN || (fs.existsSync(systemChromium) ? systemChromium : undefined)
const launchOptions = {
  ...(resolvedChromium ? { executablePath: resolvedChromium } : {}),
  // Chromium in this dev container can hang on screenshots without these flags.
  args: ['--disable-gpu', '--disable-software-rasterizer', '--disable-dev-shm-usage', '--no-sandbox'],
}

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    launchOptions,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run preview -- --host 0.0.0.0 --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
})
