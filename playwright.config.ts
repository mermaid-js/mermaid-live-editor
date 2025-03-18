import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
    permissions: ['clipboard-read', 'clipboard-write'],
    trace: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: `pnpm ${process.env.CI ? 'preview' : 'dev'}`,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
