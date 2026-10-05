import { test } from '../fixtures/automation-exercise.fixture';

test.describe('Catalog, search, subscription (Automation Exercise)', () => {
  test('TS7 — test cases page title', async ({ ae }) => {
    await ae.startAtHome();
    await ae.openTestCasesPage();
    await ae.expectTestCasesPageTitle();
  });

  test('TS8 — products list and first product detail', async ({ ae }) => {
    const FIRST_PRODUCT = { name: 'Blue Top', category: 'Women > Tops', price: 'Rs. 500' };

    await ae.startAtHome();

    await ae.openAllProducts();
    await ae.expectAllProductsPage();
    await ae.openViewProductFirst();
    await ae.expectProductDetailsPage();
    await ae.expectProductInformation(FIRST_PRODUCT);
  });

  test('TS9 — search product lists matching cards', async ({ ae }) => {
    const SEARCH_TERM = 'Blue';

    await ae.startAtHome();

    await ae.openAllProducts();
    await ae.expectAllProductsPage();
    await ae.searchProductsOnListing(SEARCH_TERM);
    await ae.expectSearchedProducts();
    await ae.expectAllSearchResultsContain(SEARCH_TERM);
  });

  test('TS10 — subscription in footer (home)', async ({ ae }) => {
    await ae.startAtHome();
    await ae.scrollToFooterAndSubscribe('test.home@example.com');
    await ae.expectSubscribedMessage();
  });

  test('TS11 — subscription in cart page', async ({ ae }) => {
    await ae.startAtHome();
    await ae.openCartFromHeader();
    await ae.expectCartPage();
    await ae.scrollToFooterAndSubscribe('test.cart@example.com');
    await ae.expectSubscribedMessage();
  });
});
