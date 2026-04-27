import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Generic UI helpers — same role as Robot `WebCore.resource`:
 * navigation, visibility waits, clicking, filling, scrolling, simple assertions.
 * Reuse across any site; keep app-specific logic in `src/sites/`.
 */

export async function gotoUrl(page: Page, pathOrUrl: string, options?: { timeout?: number }): Promise<void> {
  const raw = pathOrUrl.trim();
  const isAbsolute = /^https?:\/\//i.test(raw);
  await page.goto(isAbsolute ? raw : raw || '/', { timeout: options?.timeout, waitUntil: 'domcontentloaded' });
}

export async function expectTitleIs(page: Page, title: string | RegExp): Promise<void> {
  await expect(page).toHaveTitle(title);
}

export async function expectVisible(locator: Locator, options?: { timeout?: number }): Promise<void> {
  await expect(locator).toBeVisible(options);
}

export async function clickWhenVisible(locator: Locator, options?: { timeout?: number }): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout: options?.timeout });
  await locator.click();
}

export async function fillWhenVisible(locator: Locator, value: string, options?: { timeout?: number }): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout: options?.timeout });
  await locator.fill(value);
}

export async function checkWhenVisible(locator: Locator, options?: { timeout?: number }): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout: options?.timeout });
  await locator.check();
}

export async function selectOptionByLabel(locator: Locator, label: string, options?: { timeout?: number }): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout: options?.timeout });
  await locator.selectOption({ label });
}

export async function scrollPageToBottom(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
}

export async function expectTextContains(locator: Locator, pattern: string | RegExp): Promise<void> {
  await expect(locator).toContainText(pattern);
}

/** Clicks the first element whose text includes `text` (case-sensitive substring). */
export async function clickByVisibleText(page: Page, text: string, options?: { timeout?: number }): Promise<void> {
  const locator = page.getByText(text, { exact: false }).first();
  await clickWhenVisible(locator, options);
}
