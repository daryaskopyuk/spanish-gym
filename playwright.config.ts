import { defineConfig, devices } from '@playwright/test';

const PORT = 8085;

// Runs against the static web export in dist/ (`npm run e2e` builds it first).
export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Phone-sized viewport (iPhone 12–15 class).
    ...devices['iPhone 13'],
    browserName: 'chromium',
  },
  webServer: {
    command: `npx expo serve --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
