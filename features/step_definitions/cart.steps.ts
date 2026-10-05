import { Then, When } from '@cucumber/cucumber';
import type { AutomationExerciseWorld } from '../support/world';

When('I add product {string} to the cart', async function (this: AutomationExerciseWorld, productName: string) {
  await this.ae.addProductToCart(productName);
});

When('I add the noted {string} to the cart', async function (this: AutomationExerciseWorld, alias: string) {
  await this.ae.addProductToCart(this.notedProduct(alias).name);
});

When('I add the product to the cart from the detail page', async function (this: AutomationExerciseWorld) {
  await this.ae.addToCartOnDetailPage();
});

When('I continue shopping', async function (this: AutomationExerciseWorld) {
  await this.ae.clickContinueShopping();
});

When('I open the cart from the header', async function (this: AutomationExerciseWorld) {
  await this.ae.openCartFromHeader();
});

When('I view the cart', async function (this: AutomationExerciseWorld) {
  await this.ae.openViewCartFromModalOrLink();
});

Then('I should see the cart page', async function (this: AutomationExerciseWorld) {
  await this.ae.expectCartPage();
});

Then(
  'the cart should contain the noted {string} with quantity {int}',
  async function (this: AutomationExerciseWorld, alias: string, quantity: number) {
    await this.ae.expectProductInCart({ ...this.notedProduct(alias), quantity });
  },
);
