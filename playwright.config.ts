import { defineConfig } from '@playwright/test';
import { ACTION_TIMEOUT, BROWSER_DEVICES, NAVIGATION_TIMEOUT } from './src/config/browser';
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
    // Shared with the Cucumber hooks, see src/config/browser.ts.
    actionTimeout: ACTION_TIMEOUT,
    navigationTimeout: NAVIGATION_TIMEOUT,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...BROWSER_DEVICES.chromium } },
    { name: 'firefox', use: { ...BROWSER_DEVICES.firefox } },
    { name: 'webkit', use: { ...BROWSER_DEVICES.webkit } },
  ],
});
