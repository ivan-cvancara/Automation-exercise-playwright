import { expect } from '@playwright/test';
import { startAtAutomationExerciseHome, test } from '../fixtures/automation-exercise.fixture';

test.describe('Cart & checkout smoke (Automation Exercise)', () => {
  test('TS12 — add two products and verify cart rows', async ({ ae }) => {
    await startAtAutomationExerciseHome(ae);
    await ae.openAllProducts();
    const p1 = ae.productTileAt(1);
    const p2 = ae.productTileAt(2);
    const n1 = await ae.readProductNameInTile(p1);
    const n2 = await ae.readProductNameInTile(p2);
    const c1 = await ae.readProductPriceInTile(p1);
    const c2 = await ae.readProductPriceInTile(p2);
    await ae.addProductFromTileToCart(p1);
    await ae.clickContinueShopping();
    await ae.addProductFromTileToCart(p2);
    await ae.clickContinueShopping();
    await ae.openCartFromHeader();
    await ae.expectCartPage();
    await expect(ae.rawPage.locator('#product-1')).toContainText(n1);
    await expect(ae.rawPage.locator('#product-2')).toContainText(n2);
    await expect(ae.cartPriceForRow('1')).toContainText(c1);
    await expect(ae.cartPriceForRow('2')).toContainText(c2);
    await expect(ae.cartQuantityForRow('1')).toContainText('1');
    await expect(ae.cartQuantityForRow('2')).toContainText('1');
    await expect(ae.cartTotalForRow('1')).toContainText(c1);
    await expect(ae.cartTotalForRow('2')).toContainText(c2);
  });

  test('TS13 — quantity from product detail page', async ({ ae }) => {
    await startAtAutomationExerciseHome(ae);
    await ae.openProductDetailsByHref('/product_details/1');
    await ae.expectProductDetailsPage(false);
    const productName = await ae.readDetailProductName();
    await ae.setQuantity('4');
    await ae.addToCartOnDetailPage();
    await ae.openViewCartFromModalOrLink();
    await ae.expectCartPage();
    await expect(ae.rawPage.locator('#product-1')).toContainText(productName);
    await expect(ae.cartQuantityForRow('1')).toContainText('4');
  });

  test('TS14 — add named product to cart and open cart (checkout smoke)', async ({ ae }) => {
    await startAtAutomationExerciseHome(ae);
    await ae.addNamedProductToCartFromHomeOrListing('Sleeveless Dress');
    await ae.clickContinueShopping();
    await ae.openCartFromHeader();
    await ae.expectCartPage();
  });
});
