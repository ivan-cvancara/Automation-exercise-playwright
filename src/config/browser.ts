import { devices } from '@playwright/test';

/**
 * Browser settings shared by both runners: `playwright.config.ts` and the Cucumber hooks.
 * Change them here, so Playwright specs and Cucumber scenarios keep running in the same browser setup.
 */

// Without these limits a stuck click or navigation waits until the whole test (or Cucumber step) times out.
export const ACTION_TIMEOUT = 10_000;
export const NAVIGATION_TIMEOUT = 30_000;

/** Device emulation (viewport, user agent) per browser, the same as the Playwright projects. */
export const BROWSER_DEVICES = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
};

export type BrowserName = keyof typeof BROWSER_DEVICES;
