import { config as loadEnv } from 'dotenv'
import { defineConfig, devices } from '@playwright/test'

// Las E2E usan la rama `test` de Neon y su propio puerto: nunca tocan `dev` ni producción.
loadEnv({ path: '.env.test', override: true, quiet: true })

const PORT = 3100
const URL = `http://localhost:${PORT}`
process.env.NEXT_PUBLIC_SERVER_URL = URL

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  retries: 0,
  reporter: [['list']],
  globalTeardown: './tests/e2e/teardown.ts',
  use: { baseURL: URL, trace: 'retain-on-failure' },
  webServer: {
    command: `npm run e2e:fixtures -- up && npm run build && npx next start -p ${PORT}`,
    url: URL,
    timeout: 300_000,
    reuseExistingServer: false,
    env: process.env as Record<string, string>,
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
})
