import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT ?? 3000);

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  retries: process.env.CI ? 2 : 0,
  testDir: './tests',
  use: {
    baseURL: `http://localhost:${port}`,
    browserName: 'chromium',
    permissions: ['clipboard-read', 'clipboard-write'],
    trace: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 }
  },
  webServer: {
    command: `pnpm ${process.env.CI ? 'preview' : 'dev'}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI
  },
  workers: process.env.CI ? 3 : undefined
});
