import { expect, type Locator, type Page } from '@playwright/test';
import type { TestUser } from '@/data/types';
import { multiplyPrice } from '@/utils/price';
import { Ae } from './locators';

const HOME_TITLE = 'Automation Exercise';

/** A product as a shopper sees it on a listing: name and displayed price (e.g. `"Rs. 500"`). */
export type ListedProduct = { name: string; price: string };

export type ProductInfo = ListedProduct & { category: string };

export type CartItem = ListedProduct & { quantity: number };

/**
 * Page/service object for https://automationexercise.com — high-level steps (Robot `AutomationExercise.resource`).
 */
export class AutomationExerciseApp {
  constructor(private page: Page) {}

  /** Uses Playwright `use.baseURL` (see `playwright.config.ts`). */
  async openHome(): Promise<void> {
    await this.page.goto('/');
  }

  async acceptCookieConsent(): Promise<void> {
    const btn = Ae.consentButton(this.page);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
    }
  }

  async expectHomePage(): Promise<void> {
    await expect(this.page).toHaveTitle(HOME_TITLE);
  }

  async openSignupLogin(): Promise<void> {
    await Ae.headerLink(this.page, /Signup\s*\/\s*Login/).click();
  }

  /** Direct navigation to `/login` (both forms); prefer when the header link is flaky after redirects. */
  async goToLoginPage(): Promise<void> {
    await this.page.goto('/login');
  }

  async expectNewUserSignup(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'New User Signup!' })).toBeVisible();
  }

  async expectLoginForm(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
  }

  async fillSignupNameAndEmail(name: string, email: string): Promise<void> {
    await Ae.signupName(this.page).fill(name);
    await Ae.signupEmail(this.page).fill(email);
  }

  async submitSignup(): Promise<void> {
    await Ae.signupButton(this.page).click();
  }

  async expectEnterAccountInformation(): Promise<void> {
    await expect(this.page.locator('h2.title.text-center').getByText(/Enter/)).toBeVisible();
  }

  /** End-to-end registration from the signup form through “account created” and logged-in state. */
  async registerNewUserComplete(user: TestUser): Promise<void> {
    await this.openSignupLogin();
    await this.expectNewUserSignup();
    const displayName = `${user.firstName} ${user.lastName}`.trim();
    await this.fillSignupNameAndEmail(displayName, user.email);
    await this.submitSignup();
    await this.expectEnterAccountInformation();
    await this.fillAccountDetails(user);
    await this.createAccount();
    await this.expectAccountCreated();
    await this.continueAfterAccountMessage();
    await this.expectLoggedInText();
  }

  async fillAccountDetails(user: TestUser): Promise<void> {
    await this.page.getByRole('radio', { name: 'Mr.' }).check();
    await Ae.password(this.page).fill(user.password);
    await Ae.daySelect(this.page).selectOption('2');
    await Ae.monthSelect(this.page).selectOption({ label: 'January' });
    await Ae.yearSelect(this.page).selectOption('1981');
    await this.page.getByRole('checkbox', { name: 'Sign up for our newsletter!' }).check();
    await this.page.getByRole('checkbox', { name: 'Receive special offers from our partners!' }).check();
    await Ae.firstName(this.page).fill(user.firstName);
    await Ae.lastName(this.page).fill(user.lastName);
    await Ae.address(this.page).fill(user.address);
    await Ae.country(this.page).selectOption({ label: user.country });
    await Ae.state(this.page).fill(user.state);
    await Ae.city(this.page).fill(user.city);
    await Ae.zipcode(this.page).fill(user.zipcode);
    await Ae.mobileNumber(this.page).fill(user.mobileNumber);
  }

  async createAccount(): Promise<void> {
    await Ae.createAccount(this.page).click();
  }

  async expectAccountCreated(): Promise<void> {
    await expect(this.page.locator('h2.title.text-center').getByText(/Account Created!/i)).toBeVisible();
  }

  async continueAfterAccountMessage(): Promise<void> {
    await Ae.continueButton(this.page).click();
  }

  async expectLoggedInText(): Promise<void> {
    await expect(this.page.getByText(/Logged in as/)).toBeVisible();
  }

  async clickDeleteAccount(): Promise<void> {
    await this.page.getByRole('link', { name: /Delete Account/ }).click();
  }

  async expectAccountDeleted(): Promise<void> {
    await expect(this.page.locator('h2.title.text-center').getByText(/Account Deleted!/i)).toBeVisible();
  }

  async submitLogin(email: string, password: string): Promise<void> {
    await Ae.loginEmail(this.page).fill(email);
    await Ae.loginPassword(this.page).fill(password);
    await Ae.loginButton(this.page).click();
  }

  async logout(): Promise<void> {
    await this.page.getByRole('link', { name: /Logout/ }).click();
  }

  async expectLoginPageTitleAfterLogout(): Promise<void> {
    await expect(this.page).toHaveTitle('Automation Exercise - Signup / Login');
  }

  async expectLoginError(): Promise<void> {
    await expect(this.page.getByText(/Your email or password is incorrect!/)).toBeVisible();
  }

  async expectEmailAlreadyExists(): Promise<void> {
    await expect(this.page.getByText(/Email Address already exist!/)).toBeVisible();
  }

  async openTestCasesPage(): Promise<void> {
    await this.page.getByRole('button', { name: 'Test Cases' }).click();
  }

  async expectTestCasesPageTitle(): Promise<void> {
    await expect(this.page).toHaveTitle('Automation Practice Website for UI Testing - Test Cases');
  }

  async openAllProducts(): Promise<void> {
    await this.page.getByRole('link', { name: /Products/ }).click();
  }

  async expectAllProductsPage(): Promise<void> {
    await expect(this.page).toHaveTitle('Automation Exercise - All Products');
    await expect(this.page.locator('.features_items')).toBeVisible();
  }

  async openViewProductFirst(): Promise<void> {
    await Ae.viewProductLink(this.page).first().click();
  }

  /** Opens “View Product” of the first listed product whose name contains `productName`. */
  async openProductDetails(productName: string): Promise<void> {
    const tile = await this.findProductTileByNameOrThrow(productName);
    await Ae.viewProductLink(tile).click();
  }

  /** Checks the detail page layout that every product shares (title + info labels). */
  async expectProductDetailsPage(): Promise<void> {
    await expect(this.page).toHaveTitle('Automation Exercise - Product Details');
    for (const label of ['Availability:', 'Condition:', 'Brand:'] as const) {
      await expect(Ae.productDetailInfo(this.page).getByText(label)).toBeVisible();
    }
  }

  async expectProductInformation(product: ProductInfo): Promise<void> {
    const info = Ae.productDetailInfo(this.page);
    await expect(info.getByRole('heading', { name: product.name })).toBeVisible();
    await expect(info.getByText(`Category: ${product.category}`)).toBeVisible();
    await expect(Ae.productDetailPrice(this.page)).toHaveText(product.price);
  }

  async searchProductsOnListing(term: string): Promise<void> {
    await Ae.searchInput(this.page).fill(term);
    await Ae.searchSubmit(this.page).click();
  }

  async expectSearchedProducts(): Promise<void> {
    await expect(this.page.getByText(/Searched Products/i)).toBeVisible();
  }

  /** At least one result is shown and every listed product name contains `term` (case-insensitive). */
  async expectAllSearchResultsContain(term: string): Promise<void> {
    const names = Ae.productNames(this.page);
    await expect(names.first()).toBeVisible();
    for (const name of await names.all()) {
      await expect(name).toContainText(term, { ignoreCase: true });
    }
  }

  /** Reads name and price of the n-th product on a listing, as a shopper would note them (1 = first product). */
  async readListedProduct(position: number): Promise<ListedProduct> {
    const tile = this.productTileAt(position);
    return {
      name: await this.readProductNameInTile(tile),
      price: await this.readProductPriceInTile(tile),
    };
  }

  productTileAt(index1Based: number): Locator {
    return Ae.productCards(this.page).nth(index1Based);
  }

  async readProductNameInTile(tile: Locator): Promise<string> {
    const text = await tile.locator('.productinfo p').textContent();
    return (text ?? '').trim();
  }

  async readProductPriceInTile(tile: Locator): Promise<string> {
    const text = await tile.locator('.productinfo h2').textContent();
    return (text ?? '').trim();
  }

  async addProductFromTileToCart(tile: Locator): Promise<void> {
    await tile.hover();
    await tile.locator('.overlay-content > .btn').first().click();
  }

  async clickContinueShopping(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue Shopping' }).click();
  }

  async findProductTileByName(nameContains: string): Promise<Locator | null> {
    const cards = Ae.productCards(this.page);
    const n = await cards.count();
    // Index 0 is often a placeholder/ad row on this shop — match legacy e2e (start at 1).
    for (let i = 1; i < n; i++) {
      const t = await this.readProductNameInTile(cards.nth(i));
      if (t.includes(nameContains)) {
        return cards.nth(i);
      }
    }
    return null;
  }

  async findProductTileByNameOrThrow(nameContains: string): Promise<Locator> {
    const tile = await this.findProductTileByName(nameContains);
    if (!tile) {
      throw new Error(`Product not found: ${nameContains}`);
    }
    return tile;
  }

  /** Adds a product to the cart from the home page or a listing (hover → “Add to cart”). */
  async addProductToCart(productName: string): Promise<void> {
    await this.addProductFromTileToCart(await this.findProductTileByNameOrThrow(productName));
  }

  async openCartFromHeader(): Promise<void> {
    await this.page.getByRole('link', { name: /Cart/ }).click();
  }

  async expectCartPage(): Promise<void> {
    await expect(this.page).toHaveTitle('Automation Exercise - Checkout');
  }

  /** No explicit scroll needed: `fill` and `click` scroll the footer form into view. */
  async scrollToFooterAndSubscribe(email: string): Promise<void> {
    await expect(this.page.getByText('SUBSCRIPTION')).toBeVisible();
    await Ae.subscribeEmail(this.page).fill(email);
    await Ae.subscribeButton(this.page).click();
  }

  async expectSubscribedMessage(): Promise<void> {
    await expect(this.page.getByText('You have been successfully subscribed!')).toBeVisible();
  }

  async setQuantity(quantity: number): Promise<void> {
    await Ae.quantityInput(this.page).fill(String(quantity));
  }

  async addToCartOnDetailPage(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add to cart' }).click();
  }

  async openViewCartFromModalOrLink(): Promise<void> {
    await this.page.getByRole('link', { name: 'View Cart' }).click();
  }

  async readDetailProductName(): Promise<string> {
    const t = await Ae.productDetailInfo(this.page).locator('h2').textContent();
    return (t ?? '').trim();
  }

  async readDetailProductPrice(): Promise<string> {
    const t = await Ae.productDetailPrice(this.page).textContent();
    return (t ?? '').trim();
  }

  /** The cart has a row for the product with its unit price, quantity and line total (price × quantity). */
  async expectProductInCart(item: CartItem): Promise<void> {
    const row = Ae.cartRowByProductName(this.page, item.name);
    await expect(row).toBeVisible();
    await expect(row.locator('.cart_price')).toContainText(item.price);
    await expect(row.locator('.cart_quantity')).toHaveText(String(item.quantity));
    await expect(row.locator('.cart_total')).toContainText(multiplyPrice(item.price, item.quantity));
  }
}
