import { expect, type Locator, type Page } from '@playwright/test';
import { clickWhenVisible, expectTitleIs, expectVisible, fillWhenVisible, scrollPageToBottom, selectOptionByLabel } from '@/core/web-core';
import type { TestUser } from '@/data/types';
import { Ae } from './locators';

const HOME_TITLE = 'Automation Exercise';

/**
 * Page/service object for https://automationexercise.com — high-level steps (Robot `AutomationExercise.resource`).
 */
export class AutomationExerciseApp {
  constructor(private page: Page) {}

  get rawPage(): Page {
    return this.page;
  }

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
    await expectTitleIs(this.page, HOME_TITLE);
  }

  async openSignupLogin(): Promise<void> {
    await clickWhenVisible(Ae.headerLink(this.page, /Signup\s*\/\s*Login/));
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
    await fillWhenVisible(Ae.signupName(this.page), name);
    await fillWhenVisible(Ae.signupEmail(this.page), email);
  }

  async submitSignup(): Promise<void> {
    await clickWhenVisible(Ae.signupButton(this.page));
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
    await fillWhenVisible(Ae.password(this.page), user.password);
    await Ae.daySelect(this.page).selectOption('2');
    await selectOptionByLabel(Ae.monthSelect(this.page), 'January');
    await Ae.yearSelect(this.page).selectOption('1981');
    await this.page.getByRole('checkbox', { name: 'Sign up for our newsletter!' }).check();
    await this.page.getByRole('checkbox', { name: 'Receive special offers from our partners!' }).check();
    await fillWhenVisible(Ae.firstName(this.page), user.firstName);
    await fillWhenVisible(Ae.lastName(this.page), user.lastName);
    await fillWhenVisible(Ae.address(this.page), user.address);
    await selectOptionByLabel(Ae.country(this.page), user.country);
    await fillWhenVisible(Ae.state(this.page), user.state);
    await fillWhenVisible(Ae.city(this.page), user.city);
    await fillWhenVisible(Ae.zipcode(this.page), user.zipcode);
    await fillWhenVisible(Ae.mobileNumber(this.page), user.mobileNumber);
  }

  async createAccount(): Promise<void> {
    await clickWhenVisible(Ae.createAccount(this.page));
  }

  async expectAccountCreated(): Promise<void> {
    await expect(this.page.locator('h2.title.text-center').getByText(/Account Created!/i)).toBeVisible();
  }

  async continueAfterAccountMessage(): Promise<void> {
    await clickWhenVisible(Ae.continueButton(this.page));
  }

  async expectLoggedInBar(): Promise<void> {
    await expect(this.page.locator('i.fa.fa-user')).toBeVisible();
  }

  async expectLoggedInText(): Promise<void> {
    await expect(this.page.getByText(/Logged in as/)).toBeVisible();
  }

  async clickDeleteAccount(): Promise<void> {
    await clickWhenVisible(this.page.getByRole('link', { name: /Delete Account/ }));
  }

  async expectAccountDeleted(): Promise<void> {
    await expect(this.page.locator('h2.title.text-center').getByText(/Account Deleted!/i)).toBeVisible();
  }

  async submitLogin(email: string, password: string): Promise<void> {
    await fillWhenVisible(Ae.loginEmail(this.page), email);
    await fillWhenVisible(Ae.loginPassword(this.page), password);
    await clickWhenVisible(Ae.loginButton(this.page));
  }

  async logout(): Promise<void> {
    await clickWhenVisible(this.page.getByRole('link', { name: /Logout/ }));
  }

  async expectLoginPageTitleAfterLogout(): Promise<void> {
    await expectTitleIs(this.page, 'Automation Exercise - Signup / Login');
  }

  async expectLoginError(): Promise<void> {
    await expect(this.page.getByText(/Your email or password is incorrect!/)).toBeVisible();
  }

  async expectEmailAlreadyExists(): Promise<void> {
    await expect(this.page.getByText(/Email Address already exist!/)).toBeVisible();
  }

  async openTestCasesPage(): Promise<void> {
    await clickWhenVisible(this.page.getByRole('button', { name: 'Test Cases' }));
  }

  async expectTestCasesPageTitle(): Promise<void> {
    await expectTitleIs(
      this.page,
      'Automation Practice Website for UI Testing - Test Cases',
    );
  }

  async openAllProducts(): Promise<void> {
    await clickWhenVisible(this.page.getByRole('link', { name: /Products/ }));
  }

  async expectAllProductsPage(): Promise<void> {
    await expectTitleIs(this.page, 'Automation Exercise - All Products');
    await expectVisible(this.page.locator('.features_items'));
  }

  async openViewProductFirst(): Promise<void> {
    await clickWhenVisible(this.page.locator('.choose > .nav > li > a').first());
  }

  async expectProductDetailsPage(blueTopChecks = true): Promise<void> {
    await expectTitleIs(this.page, 'Automation Exercise - Product Details');
    if (blueTopChecks) {
      await expect(this.page.getByRole('heading', { name: 'Blue Top' })).toBeVisible();
      await expect(this.page.getByText('Category: Women > Tops')).toBeVisible();
      await expect(this.page.getByText('Rs. 500')).toBeVisible();
      for (const t of ['Availability:', 'Condition:', 'Brand:'] as const) {
        await expect(this.page.getByText(t)).toBeVisible();
      }
    }
  }

  async searchProductsOnListing(term: string): Promise<void> {
    const input = this.page.locator('input#search_product').or(this.page.locator('.input-lg')).first();
    await fillWhenVisible(input, term);
    const btn = this.page.locator('button#submit_search').or(this.page.locator('#submit_search')).or(this.page.locator('.btn-lg')).first();
    await clickWhenVisible(btn);
  }

  async expectSearchedProducts(): Promise<void> {
    await expect(this.page.getByText(/Searched Products/i)).toBeVisible();
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
    await clickWhenVisible(tile.locator('.overlay-content > .btn').first());
  }

  async clickContinueShopping(): Promise<void> {
    await clickWhenVisible(this.page.getByRole('button', { name: 'Continue Shopping' }));
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

  async addNamedProductToCartFromHomeOrListing(productName: string): Promise<void> {
    const tile = await this.findProductTileByName(productName);
    if (!tile) {
      throw new Error(`Product not found: ${productName}`);
    }
    await this.addProductFromTileToCart(tile);
  }

  async openCartFromHeader(): Promise<void> {
    await clickWhenVisible(this.page.getByRole('link', { name: /Cart/ }));
  }

  async expectCartPage(): Promise<void> {
    await expectTitleIs(this.page, 'Automation Exercise - Checkout');
  }

  async scrollToFooterAndSubscribe(email: string): Promise<void> {
    await scrollPageToBottom(this.page);
    await expect(this.page.getByText('SUBSCRIPTION')).toBeVisible();
    await fillWhenVisible(Ae.subscribeEmail(this.page), email);
    await clickWhenVisible(Ae.subscribeButton(this.page));
  }

  async expectSubscribedMessage(): Promise<void> {
    await expect(this.page.getByText('You have been successfully subscribed!')).toBeVisible();
  }

  async openProductDetailsByHref(path: string): Promise<void> {
    await this.page.locator(`a[href="${path}"]`).first().click();
  }

  async setQuantity(quantity: string): Promise<void> {
    await fillWhenVisible(Ae.quantityInput(this.page), quantity);
  }

  async addToCartOnDetailPage(): Promise<void> {
    await clickWhenVisible(this.page.getByRole('button', { name: 'Add to cart' }));
  }

  async openViewCartFromModalOrLink(): Promise<void> {
    await this.page.getByRole('link', { name: 'View Cart' }).click();
  }

  async readDetailProductName(): Promise<string> {
    const t = await this.page.locator('.product-information h2').textContent();
    return (t ?? '').trim();
  }

  cartPriceForRow(numericId: string): Locator {
    return Ae.cartRow(this.page, numericId).locator('.cart_price');
  }

  cartQuantityForRow(numericId: string): Locator {
    return Ae.cartRow(this.page, numericId).locator('.cart_quantity');
  }

  cartTotalForRow(numericId: string): Locator {
    return Ae.cartRow(this.page, numericId).locator('.cart_total');
  }
}
