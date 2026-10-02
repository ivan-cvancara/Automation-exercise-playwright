import { startAtAutomationExerciseHome, test } from '../fixtures/automation-exercise.fixture';

test.describe('Cart & checkout smoke (Automation Exercise)', () => {
  test('TS12 — add two products and verify cart rows', async ({ ae }) => {
    await startAtAutomationExerciseHome(ae);

    await ae.openAllProducts();
    const firstProduct = await ae.readListedProduct(1);
    const secondProduct = await ae.readListedProduct(2);
    await ae.addProductToCart(firstProduct.name);
    await ae.clickContinueShopping();
    await ae.addProductToCart(secondProduct.name);
    await ae.clickContinueShopping();
    await ae.openCartFromHeader();
    await ae.expectCartPage();
    await ae.expectProductInCart({ ...firstProduct, quantity: 1 });
    await ae.expectProductInCart({ ...secondProduct, quantity: 1 });
  });

  test('TS13 — quantity from product detail page', async ({ ae }) => {
    const PRODUCT_NAME = 'Blue Top';
    const QUANTITY = 4;

    await startAtAutomationExerciseHome(ae);

    await ae.openProductDetails(PRODUCT_NAME);
    await ae.expectProductDetailsPage();
    const price = await ae.readDetailProductPrice();
    await ae.setQuantity(QUANTITY);
    await ae.addToCartOnDetailPage();
    await ae.openViewCartFromModalOrLink();
    await ae.expectCartPage();
    await ae.expectProductInCart({ name: PRODUCT_NAME, price, quantity: QUANTITY });
  });

  test('TS14 — add named product to cart and open cart (checkout smoke)', async ({ ae }) => {
    await startAtAutomationExerciseHome(ae);

    await ae.addProductToCart('Sleeveless Dress');
    await ae.clickContinueShopping();
    await ae.openCartFromHeader();
    await ae.expectCartPage();
  });
});
