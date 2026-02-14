import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.jsx'],
    exclude: ['e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['src/components/games/**/*.{js,jsx}', 'src/components/layout/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.jsx', 'src/**/__tests__/**'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
