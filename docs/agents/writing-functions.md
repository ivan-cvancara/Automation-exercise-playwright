# Writing functions

Rules for code in `src/`: site app objects (`src/sites/<site>/*.app.ts`), locators, generic
helpers (`src/core/web-core.ts`) and utility functions. Read this before you add or change a function.

## Three kinds of functions

| Kind | Where | Human-step rule applies? |
|------|-------|--------------------------|
| **Step functions**: user actions and checks on a page | `src/sites/<site>/*.app.ts` (`AutomationExerciseApp`) | Yes |
| **Generic UI helpers**: site-independent actions/assertions | `src/core/web-core.ts` | Yes, but phrased generically |
| **Formatting and conversion functions**: pure data transformations | `src/utils/`, data helpers in `src/data/` | No, write them as normal clean code |

Locators in `src/sites/<site>/locators.ts` are not functions in this sense: they only describe
*where* an element is, never *what* to do with it.

## Step functions (app class)

A step function is the code behind one line of a manual test case. Its name is that line.

### One function = one human step

- An **action** function does one thing a user does: open, click, fill, select, submit, scroll.
  Filling a whole form counts as one step when a tester would describe it as one
  ("fill in the account details").
- A **check** function verifies one thing a user sees: a page, a message, a value.
- A **read** function returns one value a user can read on the page (a product name, a price).
- A **flow** function combines existing step functions into a larger journey that testers name as
  one thing ("register a new user"). It contains only calls of other step functions, in human order,
  including the checks a human would make along the way (see `registerNewUserComplete`).

### Naming

Use the verb prefixes below, followed by the business object. The name says *what* the user does,
never *how* the code does it.

| Prefix | Meaning | Returns | Example |
|--------|---------|---------|---------|
| `open*` | navigate to a page or open a section | `Promise<void>` | `openAllProducts`, `openCartFromHeader` |
| `goTo*` | direct URL navigation | `Promise<void>` | `goToLoginPage` |
| `click*` | press a single button or link | `Promise<void>` | `clickDeleteAccount`, `clickContinueShopping` |
| `fill*`, `set*`, `select*` | enter data | `Promise<void>` | `fillAccountDetails(user)`, `setQuantity(4)` |
| `submit*` | send a form | `Promise<void>` | `submitLogin(email, password)` |
| `add*`, `search*`, `logout`, ... | domain action | `Promise<void>` | `addToCartOnDetailPage`, `searchProductsOnListing(term)` |
| `expect*` | check what the user sees | `Promise<void>` | `expectCartPage`, `expectProductInCart(item)` |
| `read*` | read a visible value | `Promise<string>` or a small object | `readDetailProductPrice`, `readListedProduct(1)` |
| `find*` | locate an item the way a user scans a list | `Promise<Locator \| null>` | `findProductTileByName(name)` |
| flow name | business journey | `Promise<void>` | `registerNewUserComplete(user)` |

Avoid names that describe implementation: not `clickOverlayBtn`, `fillInputs`, `checkH2`, `getRow3`.

### Parameters

- Take business values: a `TestUser`, a product name, an email, a quantity. Not selectors, CSS
  classes or DOM indexes.
- Prefer finding things by what the user sees (`addProductToCart('Blue Top')`,
  `openProductDetails('Blue Top')`) over position. Use position only when the test case itself says
  "the first product" (`readListedProduct(1)`).
- When several values belong together, pass or return one small typed object instead of a long
  argument list: `ListedProduct`, `ProductInfo`, `CartItem` in `automation-exercise.app.ts`.
  Specs can then carry what the user saw from one step to a later check
  (`expectProductInCart({ ...firstProduct, quantity: 1 })`).
- Prefer two clearly named methods over one method with a mode flag. Example: product details are
  checked by `expectProductDetailsPage()` (layout every product has) and
  `expectProductInformation(product)` (the concrete product), not by one method with a boolean.

### Behaviour

- Action functions do not assert the outcome. Call Playwright actions directly on the locator
  (`await Ae.loginButton(this.page).click()`): they already wait until the element is visible,
  enabled and stable, so no explicit `waitFor` or "when visible" wrapper is needed. Checking the
  result belongs to an `expect*` function.
  Flow functions may include `expect*` calls as human checkpoints.
- `expect*` functions use web-first assertions (`await expect(locator).toBeVisible()`,
  `toHaveTitle`, `toContainText`) so they wait and retry.
- `read*` functions return trimmed plain values (`(text ?? '').trim()`), so specs never deal with `null`.
- Logic that a human does by looking (scan a list, find the matching product, check that every result
  matches) is allowed inside a step function, but hidden behind a business name. That is where loops
  and conditions belong, not in the spec.
- No silent `try` / `catch`. The only accepted pattern is an optional UI element a human would simply
  ignore if absent, like `acceptCookieConsent` (`isVisible().catch(() => false)`).
- Throw a clear error with the business value when something is not found:
  ``throw new Error(`Product not found: ${productName}`)``.
- Use the locator from `Ae.*`. Do not inline new selectors in
  the app class when they are reused or non-trivial; add them to `locators.ts`.
- Do not call `test.step`, `test.skip` or other Playwright Test APIs here. The class is shared with
  Cucumber, where they do not exist. Importing `expect` from `@playwright/test` is fine.

### Size and order

- Keep step functions short (typically 1 to 5 lines; flows up to about 15 calls).
- Order methods in the class by user journey or page (home, login/signup, account, products, cart,
  footer), not alphabetically. Add a new method next to the methods of the same page.

### Documentation

- Add a one-line JSDoc only when the name is not enough: a workaround, a site quirk, a non-obvious
  choice (see `goToLoginPage`, `findProductTileByName`). Do not restate the name.

## Generic UI helpers (`web-core.ts`)

- Generic name and parameters, no site URLs, selectors or texts: `expectTextVisible(page, text)`.
- Never wrap a single Playwright call (`click`, `fill`, `selectOption`, `goto`, `expect(...)`) and
  never scroll manually: Playwright already waits for actionability and scrolls into view.
- Add a helper only when at least two places need it and it combines several calls or wraps a
  pattern that is easy to get wrong. Remove helpers nobody calls.

## Locators (`locators.ts`)

- One entry per element, as a function `(p: Page, ...args) => Locator`, so every call queries fresh.
  To scope an element to a part of the page, accept `scope: Page | Locator` (see `viewProductLink`).
- Name by the business meaning of the element: `loginEmail`, `subscribeButton`, `cartRowByProductName`.
- Locator priority: `getByRole` / `getByLabel` / `getByPlaceholder` / `getByText`, then
  `[data-qa="..."]`, then ids. Avoid long CSS chains, XPath and positional selectors.
- No actions and no assertions in locators.

## Formatting and conversion functions (exception)

Functions that only transform data are **not** human steps. The readable-steps rule does not apply.
Write them as small, ordinary, well-tested utility code.

Examples: `withUniqueEmail(user)`, parsing a price `"Rs. 500"` into `500`, formatting a date for a
form field, building a display name from first and last name, normalising whitespace.

Rules:

- Put generic ones in `src/utils/<topic>.ts` (see `src/utils/price.ts`: `parsePrice`, `formatPrice`,
  `multiplyPrice`). Test data helpers stay in `src/data/`.
- Pure and synchronous: input in, output out. No `Page`, no `Locator`, no browser, no I/O
  (reading `users.json` in `user-loader.ts` is the exception for data loading).
- Name by the transformation: `parseX`, `formatX`, `toX`, `withX`, `normalizeX`, `buildX`, or a verb
  for a calculation (`multiplyPrice`).
- Explicit parameter and return types. Do not mutate the input, return a new value
  (as `withUniqueEmail` returns a copy).
- Handle edge cases explicitly (empty string, missing field) instead of returning `NaN` or `undefined`
  silently; throw with a clear message if the input is invalid.
- Loops, regexes and conditions are fine here.
- Prefer calling them inside step functions, so the spec stays in business language. Example:
  `expectProductInCart(item)` computes the expected line total with `multiplyPrice(item.price, item.quantity)`
  internally, and the spec only says which product and quantity it expects. Calling a helper directly
  in a spec is acceptable when it prepares test data.

## General TypeScript style

- `strict` mode, no `any`, no non-null `!` except right after a `test.skip(!x, ...)` guard.
- `async` / `await` everywhere. A missing `await` is caught by `npm run lint` (`no-floating-promises`).
- Import from `src/` via the `@/` alias. Use `import type` for type-only imports.
- Match the surrounding code: single quotes, semicolons, 2-space indent, trailing commas in multi-line
  literals.
