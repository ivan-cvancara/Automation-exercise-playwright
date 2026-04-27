import { expect } from '@playwright/test';
import { startAtAutomationExerciseHome, test } from '../fixtures/automation-exercise.fixture';

test.describe('Catalog, search, subscription (Automation Exercise)', () => {
  test('TS7 — test cases page title', async ({ ae }) => {
    await startAtAutomationExerciseHome(ae);
    await ae.openTestCasesPage();
    await ae.expectTestCasesPageTitle();
  });

  test('TS8 — products list and first product detail', async ({ ae }) => {
    await startAtAutomationExerciseHome(ae);
    await ae.openAllProducts();
    await ae.expectAllProductsPage();
    await ae.openViewProductFirst();
    await ae.expectProductDetailsPage();
  });

  test('TS9 — search product lists matching cards', async ({ ae, page }) => {
    await startAtAutomationExerciseHome(ae);
    await ae.openAllProducts();
    await ae.expectAllProductsPage();
    await ae.searchProductsOnListing('Blue');
    await ae.expectSearchedProducts();
    const count = await page.locator('.col-sm-4').count();
    for (let i = 1; i < count; i++) {
      const product = page.locator('.col-sm-4').nth(i);
      const name = (await product.locator('.productinfo p').textContent() ?? '').toLowerCase();
      expect(name).toContain('blue');
    }
  });

  test('TS10 — subscription in footer (home)', async ({ ae }) => {
    await startAtAutomationExerciseHome(ae);
    await ae.scrollToFooterAndSubscribe('test.home@example.com');
    await ae.expectSubscribedMessage();
  });

  test('TS11 — subscription in cart page', async ({ ae }) => {
    await startAtAutomationExerciseHome(ae);
    await ae.openCartFromHeader();
    await ae.expectCartPage();
    await ae.scrollToFooterAndSubscribe('test.cart@example.com');
    await ae.expectSubscribedMessage();
  });
});
