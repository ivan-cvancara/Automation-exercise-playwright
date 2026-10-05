# Writing tests

Rules for Playwright specs (`tests/**/*.spec.ts`) and Cucumber scenarios (`features/**/*.feature`).
Read this before you add or change a test.

## The core principle

**A test reads like a manual test case.** Someone who has never seen the code should be able to read
a test from top to bottom and repeat it by hand in a browser, step by step, in the same order.

That means:

- Every line in the test body is one step a human would do or check:
  open a page, click something, fill a form, look at the result.
- Steps appear in the order a real user performs them. No setup hidden in the middle, no checks
  moved to the end "for convenience".
- Checks happen at the moment a human would look. If a tester would confirm "the signup form is
  shown" before filling it, the test calls `ae.expectNewUserSignup()` before `ae.fillSignupNameAndEmail(...)`.
- The vocabulary is the vocabulary of the user and the business (product, cart, account, login),
  not of the DOM (div, row, tile index, selector).

The technical work (selectors, waiting, finding elements, reading text) lives in the site layer
(`src/sites/<site>/`), see [writing-functions.md](writing-functions.md).

## Test structure

Every test follows the same four phases. Do not mix them.

1. **Data** – load and prepare test data (`getUserByTestName`, `withUniqueEmail`, constants).
2. **Start** – put the browser into the starting state a tester would begin from
   (`await startAtAutomationExerciseHome(ae)`).
3. **Steps and checks** – the user journey: actions interleaved with checks, in human order.
4. **Cleanup** – undo what the test created (for example delete the account), done through the UI
   steps a human would use.

```ts
test('TS2 - login with correct email and password, then delete account', async ({ ae }) => {
  const base = getUserByTestName('TC01 Register User');
  test.skip(!base, 'Add key TC01 Register User in src/data/users.json');
  const user = withUniqueEmail(base!);

  await startAtAutomationExerciseHome(ae);

  await ae.registerNewUserComplete(user);
  await ae.logout();
  await ae.expectLoginForm();
  await ae.submitLogin(user.email, user.password);
  await ae.expectLoggedInText();

  await ae.clickDeleteAccount();
  await ae.expectAccountDeleted();
});
```

Separate the phases with one blank line. No comments are needed when the method names tell the story.

For long tests (roughly more than 12 steps) group the journey with `test.step` so the HTML report
reads like a test protocol:

```ts
await test.step('Register a new user', async () => {
  await ae.registerNewUserComplete(user);
});
await test.step('Log out and log in again', async () => {
  await ae.logout();
  await ae.submitLogin(user.email, user.password);
  await ae.expectLoggedInText();
});
```

`test.step` belongs in specs only. Never call it inside `AutomationExerciseApp`, the same class is
used by Cucumber, where `test.step` throws.

## Rules for the test body

**Allowed** in a test body:

- calls of `ae.*` methods and of fixture helpers such as `startAtAutomationExerciseHome`,
- loading and preparing data (`getUserByTestName`, `withUniqueEmail`, named constants),
- formatting and conversion helpers from `src/utils/` (see [writing-functions.md](writing-functions.md)),
- `expect(...)` on values or locators returned by `ae.*` when no `expectX` method fits yet,
- `test.skip(condition, reason)` for missing data, `test.step` for grouping.

**Not allowed** in a test body:

| Do not | Do instead |
|--------|------------|
| `page.locator(...)`, `page.getBy*(...)`, any CSS/XPath (`npm run lint` fails) | Add a locator to `locators.ts` and a method to the app class |
| `for` / `while` loops, `if` / `else`, `try` / `catch` | Move the logic into one app method with a business name, e.g. `expectAllSearchResultsContain('Blue')` |
| Calculations, string parsing, regex juggling | A conversion helper in `src/utils/` or a `readX` method in the app class |
| Magic values with unclear meaning (`'4'`, `'/product_details/1'`) without context | A named constant (`const QUANTITY = 4`) or a self-explaining method argument |
| Sleeps, manual retries (`waitForTimeout` fails lint) | Web-first assertions inside `expectX` methods |
| Several unrelated user journeys in one test | One test per journey |

### Example

Each line is a step from the manual test case "search for Blue, every result is a blue product":

```ts
test('TS9 - search shows only matching products', async ({ ae }) => {
  const SEARCH_TERM = 'Blue';

  await startAtAutomationExerciseHome(ae);

  await ae.openAllProducts();
  await ae.expectAllProductsPage();
  await ae.searchProductsOnListing(SEARCH_TERM);
  await ae.expectSearchedProducts();
  await ae.expectAllSearchResultsContain(SEARCH_TERM);
});
```

Checking every result needs a loop. The loop lives in `AutomationExerciseApp.expectAllSearchResultsContain`
behind a business name, not in the spec.

### Reference specs

Use these as templates when writing a new test:

- `tests/automation-exercise/cart.spec.ts`, **TS12**: remembers what the shopper sees on a listing
  (`readListedProduct`) and later checks it in the cart (`expectProductInCart`).
- `tests/automation-exercise/cart.spec.ts`, **TS13**: named constants for test inputs, a value read
  on the way (`readDetailProductPrice`), a single business-level cart check.
- `tests/automation-exercise/auth.spec.ts`: data phase with `getUserByTestName` + `withUniqueEmail`
  and UI cleanup at the end.

If you find a spec that still contains raw selectors, loops or calculations, refactor it to this
pattern instead of copying it.

## Naming

- **Test title:** `TSxx - <what the user does> <what they should see>`, written as a sentence a tester
  understands, e.g. `TS3 - wrong password shows an error, correct password logs in`.
  Use a plain hyphen after the ID in new titles; leave older titles alone.
- **`test.describe`:** one per feature area, named after the area and site,
  e.g. `Cart & checkout (Automation Exercise)`.
- **Test data keys** in `users.json`: describe the persona or purpose (`"TC01 Register User"`),
  not the implementation.

## Independence

- Each test can run alone, in any order and in parallel (`fullyParallel: true`).
- Never rely on state from another test (logged-in user, cart content).
- A test that creates data (account, subscription with a unique email) uses unique data
  (`withUniqueEmail`) and cleans up through the UI when the site allows it.

## Assertions

- Prefer an `expectX` method of the app class over a raw `expect` in the spec. The method name is
  the check a human performs: `expectCartPage`, `expectLoginError`, `expectAccountDeleted`.
- When asserting in the spec, assert on what the user sees (text, title, visibility), not on
  internal attributes or classes.
- One check per thing a human would verify. Do not bundle unrelated checks into one `expectX`
  method just to save lines.

## Cucumber scenarios

The same principle applies, even more strictly: a `.feature` file is the manual test case.

### Features mirror the Playwright specs

Every Automation Exercise spec has a twin feature file with the same structure. Keep them in sync:
when you add, change or remove a test in a spec, do the same in its feature (and the other way round).

| Playwright | Cucumber |
|------------|----------|
| `tests/automation-exercise/<area>.spec.ts` | `features/automation-exercise/<area>.feature` |
| `test.describe('<name>')` | `Feature: <name>` + a feature tag (`@auth`, `@catalog`, `@cart`) |
| data + `startAtAutomationExerciseHome` shared by all tests | `Background:` with the same steps in the same order |
| `test('TSxx - <title>')` | `Scenario: TSxx - <title>` with tags `@TSxx @TCxx` |
| one `ae.*` call | one Gherkin step (one step definition calling that one method) |
| named constants in the data phase | values written directly in the step (`"Blue Top"`, `4`, data table) |
| local variable (`const firstProduct = await ae.readListedProduct(1)`) | "note" step storing it in the World (`I note the product at position 1 as "first product"`) |
| `test.skip(!base, ...)` | the data step returns `'skipped'` |

`@TCxx` is the number of the test case on https://automationexercise.com/test_cases. Leave it out
when the test covers only part of a test case (TS14), and say so in a `#` comment above the scenario.

Run one scenario or area by tag: `npx cucumber-js --tags @TS9`, `npx cucumber-js --tags @cart`.

### Writing steps

- Write steps in plain business language from the user's point of view, present tense, first person:
  `Given I start at the Automation Exercise home page`, `When I add product "Sleeveless Dress" to the cart`,
  `Then I should see the cart page`.
- `Given` = starting state and test data, `When` = user action, `Then` = what the user sees. Use
  `And` / `But` instead of repeating the keyword. A journey with checks in between alternates
  `When` / `Then` blocks, in the same order as the spec.
- No selectors, URLs (except a human-meaningful page name), technical IDs or timeouts in Gherkin.
- Use `Background` for shared starting steps and `Scenario Outline` + `Examples` for the same journey
  with different data.
- A step definition is thin: it calls one `this.ae.*` method and contains no selectors or logic.
  Reuse existing step definitions before adding new ones, and phrase new steps so they are reusable
  (parameters via `{string}`, `{int}`, data tables for objects).
- Values a scenario has to remember between steps live in the World (`this.user`,
  `this.notedProducts`), read them with `this.requireUser()` / `this.notedProduct(alias)` so a
  missing "note" step fails with a clear message.
- Step definitions are grouped by page or area: `automation-exercise-home.steps.ts` (start, home,
  test cases page), `auth.steps.ts`, `products.steps.ts`, `cart.steps.ts`, `footer.steps.ts`.
  Step texts are global in Cucumber, so never define the same text twice.

```gherkin
@TS13 @TC13
Scenario: TS13 - quantity from product detail page
  When I open the details of product "Blue Top"
  Then I should see the product details page
  When I note the displayed price of "Blue Top"
  And I set the quantity to 4
  And I add the product to the cart from the detail page
  And I view the cart
  Then I should see the cart page
  And the cart should contain the noted "Blue Top" with quantity 4
```

Compare it line by line with TS13 in `tests/automation-exercise/cart.spec.ts`: the steps match one to one.
