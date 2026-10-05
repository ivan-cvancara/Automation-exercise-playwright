import { defineConfig, devices } from '@playwright/test';
import { AUTOMATION_EXERCISE_BASE } from './src/config/env';

const isCI = !!process.env.CI;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // One retry on CI only, to survive a hiccup of the live site. Retried tests are reported as "flaky",
  // so they stay visible instead of being silently hidden.
  retries: isCI ? 1 : 0,
  // No `workers` override: Playwright uses half of the CPU cores, so `fullyParallel` really runs in parallel on CI.
  reporter: isCI
    ? [['github'], ['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'on-failure' }]],
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: AUTOMATION_EXERCISE_BASE,
    // Without these limits a stuck click or navigation waits until the whole test times out.
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
