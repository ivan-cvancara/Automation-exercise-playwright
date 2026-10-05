import { expect, type Page } from '@playwright/test';

/**
 * Generic, site-independent helpers. Only for patterns that plain Playwright does not cover in one call.
 * Do not wrap `click`, `fill`, `selectOption` or `expect(...)`: Playwright already waits for
 * actionability and web-first assertions already retry.
 */

/** Asserts that `text` is visible somewhere on the page (substring match over the whole document). */
export async function expectTextVisible(page: Page, text: string): Promise<void> {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
}
