import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const BACKEND_PORT = 3001;
const FRONTEND_PORT = 5174;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

const BACKEND_DIR = path.join(__dirname, 'backend');
const FRONTEND_DIR = path.join(__dirname, 'frontend');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // тесты используют общий backend state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      cwd: BACKEND_DIR,
      url: `${BACKEND_URL}/event-types`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        PORT: String(BACKEND_PORT),
        NODE_ENV: 'test',
      },
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // --mode test загружает frontend/.env.test (VITE_API_BASE_URL=http://localhost:3001)
      // --port задаёт порт для vite dev server
      command: `npm run dev -- --mode test --port ${FRONTEND_PORT}`,
      cwd: FRONTEND_DIR,
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});

export { BACKEND_URL, FRONTEND_URL };
