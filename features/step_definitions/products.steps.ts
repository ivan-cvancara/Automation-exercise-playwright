import { Then, When, type DataTable } from '@cucumber/cucumber';
import type { AutomationExerciseWorld } from '../support/world';

When('I open all products', async function (this: AutomationExerciseWorld) {
  await this.ae.openAllProducts();
});

Then('I should see the All Products page', async function (this: AutomationExerciseWorld) {
  await this.ae.expectAllProductsPage();
});

When('I search for products {string}', async function (this: AutomationExerciseWorld, term: string) {
  await this.ae.searchProductsOnListing(term);
});

Then('I should see the searched products', async function (this: AutomationExerciseWorld) {
  await this.ae.expectSearchedProducts();
});

Then('every search result should contain {string}', async function (this: AutomationExerciseWorld, term: string) {
  await this.ae.expectAllSearchResultsContain(term);
});

When('I note the product at position {int} as {string}', async function (this: AutomationExerciseWorld, position: number, alias: string) {
  this.notedProducts[alias] = await this.ae.readListedProduct(position);
});

When('I open the details of the first product', async function (this: AutomationExerciseWorld) {
  await this.ae.openViewProductFirst();
});

When('I open the details of product {string}', async function (this: AutomationExerciseWorld, productName: string) {
  await this.ae.openProductDetails(productName);
});

Then('I should see the product details page', async function (this: AutomationExerciseWorld) {
  await this.ae.expectProductDetailsPage();
});

Then('I should see the product information:', async function (this: AutomationExerciseWorld, table: DataTable) {
  const { name, category, price } = table.rowsHash();
  await this.ae.expectProductInformation({ name, category, price });
});

When('I note the displayed price of {string}', async function (this: AutomationExerciseWorld, productName: string) {
  this.notedProducts[productName] = { name: productName, price: await this.ae.readDetailProductPrice() };
});

When('I set the quantity to {int}', async function (this: AutomationExerciseWorld, quantity: number) {
  await this.ae.setQuantity(quantity);
});
