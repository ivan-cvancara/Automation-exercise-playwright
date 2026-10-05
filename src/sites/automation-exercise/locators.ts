import type { Locator, Page } from '@playwright/test';

/**
 * Central locators for automationexercise.com (same idea as `${AE_LOC_*}` in Robot).
 * Expose as functions so we always re-query fresh elements.
 */
export const Ae = {
  consentButton: (p: Page) => p.getByRole('button', { name: 'Consent' }),
  headerLink: (p: Page, name: RegExp | string) => p.getByRole('link', { name: name }),
  loginEmail: (p: Page) => p.locator('[data-qa="login-email"]'),
  loginPassword: (p: Page) => p.locator('[data-qa="login-password"]'),
  loginButton: (p: Page) => p.locator('[data-qa="login-button"]'),
  signupName: (p: Page) => p.locator('[data-qa="signup-name"]'),
  signupEmail: (p: Page) => p.locator('[data-qa="signup-email"]'),
  signupButton: (p: Page) => p.locator('[data-qa="signup-button"]'),
  password: (p: Page) => p.locator('[data-qa="password"]'),
  firstName: (p: Page) => p.locator('[data-qa="first_name"]'),
  lastName: (p: Page) => p.locator('[data-qa="last_name"]'),
  address: (p: Page) => p.locator('[data-qa="address"]'),
  country: (p: Page) => p.locator('#country'),
  state: (p: Page) => p.locator('[data-qa="state"]'),
  city: (p: Page) => p.locator('[data-qa="city"]'),
  zipcode: (p: Page) => p.locator('[data-qa="zipcode"]'),
  mobileNumber: (p: Page) => p.locator('[data-qa="mobile_number"]'),
  createAccount: (p: Page) => p.locator('[data-qa="create-account"]'),
  continueButton: (p: Page) => p.locator('[data-qa="continue-button"]'),
  daySelect: (p: Page) => p.locator('#days'),
  monthSelect: (p: Page) => p.locator('#months'),
  yearSelect: (p: Page) => p.locator('#years'),
  productCards: (p: Page) => p.locator('.col-sm-4'),
  productNames: (p: Page) => p.locator('.features_items .productinfo p'),
  /** “View Product” link; pass a product tile to scope it to one product. */
  viewProductLink: (scope: Page | Locator) => scope.locator('.choose .nav a'),
  productDetailInfo: (p: Page) => p.locator('.product-information'),
  productDetailPrice: (p: Page) => p.locator('.product-information > span > span'),
  searchInput: (p: Page) => p.locator('#search_product'),
  searchSubmit: (p: Page) => p.locator('#submit_search'),
  subscribeEmail: (p: Page) => p.getByPlaceholder('Your email address'),
  subscribeButton: (p: Page) => p.locator('#subscribe'),
  quantityInput: (p: Page) => p.locator('#quantity'),
  cartRowByProductName: (p: Page, name: string) =>
    p.locator('#cart_info_table tbody tr').filter({ has: p.locator('.cart_description').getByText(name, { exact: true }) }),
} as const;
