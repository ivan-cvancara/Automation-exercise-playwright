# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

**Project language is English.** Code, comments, test titles, Gherkin, docs, README and commit
messages are written in English, even when the conversation with the user is in another language.

**Before writing code, read the detailed guide for the task:**

| Task | Read |
|------|------|
| Adding or changing a spec, `.feature` file or step definition | [docs/agents/writing-tests.md](docs/agents/writing-tests.md) |
| Adding or changing app methods, locators, helpers or utilities in `src/` | [docs/agents/writing-functions.md](docs/agents/writing-functions.md) |
| **Implementing a Gherkin scenario the user wrote** (tagged `@new`, or undefined steps) | [docs/agents/implementing-scenarios.md](docs/agents/implementing-scenarios.md) (all three guides apply) |

This file contains the overview, commands and the short version of the rules.

**These instructions are part of the code.** When your change affects how code should be written
elsewhere in the project, update the rules in the same change. See
[Keep the instructions in sync](#keep-the-instructions-in-sync).

**Main workflow:** the user writes Gherkin scenarios by hand, the agent implements everything else
(step definitions, app methods, locators, the twin Playwright spec) and verifies both runners.
In Claude Code this is the `/implement-scenario` skill (`.claude/skills/implement-scenario/`).

## Project overview

Playwright training project: E2E tests in TypeScript against the public demo shop
[Automation Exercise](https://automationexercise.com).

Two runners share the same code in `src/`:

- **Playwright Test** (`tests/**/*.spec.ts`) – the main suite, runs in CI.
- **Cucumber.js** (`features/**/*.feature`) – Gherkin scenarios that drive Playwright directly, also run in CI (Chromium).

Stack: Node LTS, TypeScript (strict, `noEmit`), `@playwright/test`, `@cucumber/cucumber`, `ts-node`.

## Commands

```bash
npm install && npx playwright install       # first setup (browsers are required)
npm run typecheck                           # tsc --noEmit over src, tests, features, scripts
npm run lint                                # ESLint (no-floating-promises, Playwright rules, no selectors in specs)
npm run verify                              # everything to run before finishing: typecheck, lint, step catalog, Chromium, Cucumber
npm run test:ae -- --project=chromium       # Automation Exercise suite, one browser (fast loop)
npx playwright test path/to/file.spec.ts -g "TS9"   # single file / single test by title
npm run test:cucumber                       # Cucumber scenarios (headless Chromium, BROWSER=firefox|webkit to switch)
npx cucumber-js --tags @TS9                 # single scenario / area by tag (@auth, @catalog, @cart)
npm test                                    # full Playwright suite, all 3 browsers
npm run report                              # open the last HTML report
npm run steps                               # catalog of existing Cucumber steps (-- --write updates docs/steps-catalog.md)
npm run inspect -- /contact_us              # ARIA snapshot + form controls of a live page, for designing locators
```

Other scripts: `test:ui`, `test:headed`.

## Repository map

| Path | Purpose |
|------|---------|
| `src/config/env.ts` | `AUTOMATION_EXERCISE_BASE` (from `BASE_URL`, defaults to the public site) |
| `src/config/browser.ts` | Device emulation and action/navigation timeouts shared by both runners |
| `src/core/web-core.ts` | Site-agnostic helpers (`expectTextVisible`); no wrappers around plain Playwright calls |
| `src/sites/automation-exercise/locators.ts` | All Automation Exercise locators, exported as the `Ae` object |
| `src/sites/automation-exercise/automation-exercise.app.ts` | `AutomationExerciseApp`: page/service object with high-level steps |
| `src/data/users.json`, `user-loader.ts`, `types.ts` | Test data keyed by name, `getUserByTestName`, `withUniqueEmail`, `TestUser` |
| `tests/fixtures/automation-exercise.fixture.ts` | `test` extended with the `ae` fixture |
| `tests/automation-exercise/` | Automation Exercise specs (`auth`, `catalog`, `cart`) |
| `features/automation-exercise/` | `*.feature` twins of the specs (`auth`, `catalog`, `cart`) + `smoke.feature` |
| `features/step_definitions/`, `features/support/` | Step definitions by page/area, World + hooks |
| `src/utils/` | Pure formatting and conversion functions (`price.ts`) |
| `docs/agents/` | Detailed agent guides: writing tests, writing functions, implementing scenarios |
| `docs/writing-scenarios.md`, `docs/scenario-template.feature` | User guide and template for writing scenarios |
| `docs/steps-catalog.md` | Generated catalog of all step definitions (`npm run steps -- --write`) |
| `scripts/` | `list-steps.js` (step catalog), `inspect-page.ts` (page inspector) |
| `.claude/skills/implement-scenario/` | Claude Code skill for the main workflow |
| `playwright.config.ts`, `cucumber.yml`, `tsconfig.json`, `eslint.config.mjs` | Runner, compiler and lint config |

Import from `src/` via the `@/` alias (`@/core/web-core`, `@/sites/...`). It works in both runners
(Playwright reads `tsconfig.json` paths, Cucumber uses `tsconfig-paths/register`).

## Architecture rules

Keep the three layers separate. Put code in the lowest layer where it fits:

1. **`src/core/web-core.ts`** – generic, reusable helpers. No URLs, selectors or texts of any specific
   site. Do not wrap `click`, `fill`, `selectOption` or `expect`: Playwright already auto-waits and
   web-first assertions already retry. Call them directly on `Ae.*` locators.
2. **`src/sites/<site>/`** – everything site-specific.
   - New selectors go into `locators.ts` as functions `(p: Page, ...) => Locator`, so every call
     queries the page fresh.
   - Page behaviour goes into `AutomationExerciseApp` as small `async` methods named
     `openX` / `fillX` / `submitX` / `expectX`. Compose them into larger flows
     (see `registerNewUserComplete`).
3. **Specs and step definitions** – short and readable, they only call `ae.*` and web-core helpers.
   Avoid raw selectors here. If a spec needs a new selector or interaction, add it to the site layer
   first. Reference specs: `tests/automation-exercise/cart.spec.ts` and `catalog.spec.ts`.

When adding a new site, create `src/sites/<site>/` with its own `locators.ts` and `*.app.ts`, plus a
fixture in `tests/fixtures/` and a spec folder in `tests/<site>/`.

## Core principle: tests read like a manual test case

Full rules: [docs/agents/writing-tests.md](docs/agents/writing-tests.md) and
[docs/agents/writing-functions.md](docs/agents/writing-functions.md). The short version:

- A person who has never seen the code can read a test top to bottom and repeat it by hand in a
  browser. Each line is one step a human does or checks, in the order a human does it.
- Tests use business language (`ae.openCartFromHeader()`, `ae.expectLoginError()`), never DOM details.
  No selectors, loops, conditions or calculations in specs or step definitions.
- Test body phases: **data**, **start** (`ae.startAtHome()`), **steps and checks**,
  **cleanup**, separated by blank lines.
- One app method = one human step, named with a verb prefix: `open*`, `click*`, `fill*`, `select*`,
  `submit*`, `expect*` (check), `read*` (return a visible value), `find*`. Flow methods
  (`registerNewUserComplete`) only chain other step methods.
- Action methods do not assert outcomes, `expect*` methods only assert.
- **Exception:** formatting and conversion functions (`withUniqueEmail`, price parsing, date
  formatting) are ordinary pure utility code in `src/utils/` or `src/data/`. The human-step rule
  does not apply to them.

## Writing Playwright tests

- Automation Exercise specs import `test` (and optionally `expect`) from
  `tests/fixtures/automation-exercise.fixture.ts`, never from `@playwright/test` directly, otherwise
  the `ae` fixture is missing.
- Start each test with `await ae.startAtHome()` (opens `/`, accepts the cookie
  consent dialog, checks the home page title).
- `baseURL` is the Automation Exercise URL (from `src/config/env.ts`), so use relative paths
  (`page.goto('/login')`). For any other site use a full URL (`page.goto('https://...')`).
- To open signup/login, prefer `ae.goToLoginPage()` (direct `/login`) over the header link
  `ae.openSignupLogin()`, which is flaky after redirects.
- Test titles follow the pattern `TSxx - <what the user does> <what they should see>`, with a plain
  hyphen in new titles (older titles contain a different dash character, leave those as they are).
  Use one `test.describe` per feature area.
- Every test must be independent and runnable in parallel (`fullyParallel: true`). A test that
  creates an account also deletes it at the end (`ae.clickDeleteAccount()` + `ae.expectAccountDeleted()`).

### Playwright best practices

- Locator priority: `getByRole` / `getByLabel` / `getByPlaceholder` / `getByText`, then the site's
  `[data-qa="..."]` attributes, then ids. Avoid long CSS chains, XPath and `nth()` where a better
  handle exists.
- Use web-first assertions that auto-retry: `await expect(locator).toBeVisible()`,
  `toHaveText`, `toContainText`, `toHaveTitle`, `toHaveURL`. Avoid
  `expect(await locator.textContent()).toBe(...)` for anything that can change over time.
- `npm run lint` enforces, and you must not disable: no selectors in specs and step definitions,
  no `waitForTimeout`, no `{ force: true }`, no `test.only`, no un-awaited promises. Fix the cause
  (wrong element, overlay, missing locator method) instead of adding an `eslint-disable` comment.
- Do not raise global timeouts or retries to hide flakiness.

## Test data

- Users live in `src/data/users.json` under `users["<key>"]`, typed by `TestUser` in `types.ts`.
  Add new fields to the type as optional unless every user has them.
- Load with `getUserByTestName('<key>')`. The key is a stable data name such as
  `"TC01 Register User"`, not necessarily the exact test title. Guard against a missing key:

  ```ts
  const base = getUserByTestName('TC01 Register User');
  test.skip(!base, 'Add key TC01 Register User in src/data/users.json');
  const user = withUniqueEmail(base!);
  ```

- Always wrap a user with `withUniqueEmail(user)` before registering, so parallel runs and reruns do
  not collide on "Email Address already exist!".
- Data is fake. Never put real personal data or real credentials in the repo.

## Cucumber (Gherkin)

- Config: `cucumber.yml`. Scenarios in `features/**/*.feature`, steps in `features/step_definitions/`,
  World and hooks in `features/support/`.
- **Each spec has a twin feature** (`auth.spec.ts` ↔ `auth.feature`, ...): same Feature/Scenario
  names, tags `@TSxx @TCxx`, one Gherkin step per `ae.*` call. Change both together. Details in
  [docs/agents/writing-tests.md](docs/agents/writing-tests.md#cucumber-scenarios).
- Cucumber does not use the Playwright Test runner, so `test.extend` fixtures and `playwright.config.ts`
  do not apply. Inside steps use the World (`this.page`, `this.ae`, typed as
  `this: AutomationExerciseWorld`) and reuse helpers from `src/` (for example
  `this.ae.startAtHome()`). Step definitions never import from `tests/`; code both runners need lives in `src/`.
- Step functions must be regular `async function`, not arrow functions, otherwise `this` is not the World.
- `features/support/hooks.ts` launches one headless browser per worker (`BROWSER` env, Chromium by
  default) and a fresh browser context per scenario with `baseURL` set to `AUTOMATION_EXERCISE_BASE`
  and the same device and action/navigation timeouts as the Playwright projects (`src/config/browser.ts`),
  and sets the step timeout to 30 s (Cucumber's 5 s default is too short for flow steps on the live
  site). On failure it attaches a screenshot to the report and saves a trace to
  `test-results/cucumber-traces/`. `cucumber.yml` runs 2 parallel workers.
- Write steps in business language ("Given I start at the Automation Exercise home page"), reuse
  existing steps before adding new ones, and use Cucumber expressions (`{string}`, `{int}`) for
  parameters. Keep steps thin, put logic into `AutomationExerciseApp`.
- The HTML report goes to `test-results/cucumber-report.html`, JUnit XML to `test-results/cucumber-junit.xml`.
- Scenarios tagged `@new` are written by the user and not implemented yet. Implement them by
  [docs/agents/implementing-scenarios.md](docs/agents/implementing-scenarios.md), then replace the tag with `@TSxx` / `@TCxx`.
- After adding or changing step definitions, refresh the catalog: `npm run steps -- --write`
  (CI fails when it is out of date).

## Known pitfalls

- The tests run against a **live public site**. Content (product names, prices, ads) can change and the
  site can be slow. Before "fixing" a failing test, check whether the site itself changed.
- Automation Exercise sometimes shows ad overlays or a cookie consent dialog. Consent is handled by
  `ae.acceptCookieConsent()`. If ads block clicks, handle it centrally (for example in the fixture),
  not with `force: true` in individual tests.
- On product listings, the first `.col-sm-4` element is not a product card, so loops start at index 1
  (see `findProductTileByName`).
- `AUTOMATION_EXERCISE_BASE` comes from the `BASE_URL` environment variable and defaults to the
  public site. Both runners and `npm run inspect` use it.

## Keep the instructions in sync

`AGENTS.md`, `docs/agents/`, `.claude/skills/` and `README.md` describe how to write code here. A
rule that no longer matches the code makes the next agent repeat a removed pattern. So whenever
you finish a change, ask: *does this change how someone should write code elsewhere?* If yes,
update the rules **in the same change**.

Typical triggers:

- You add, rename or remove a helper, app method, locator pattern, fixture, script, command,
  config option, lint rule or folder that the instructions mention or that others should use.
- You change a convention: naming, test structure, data handling, cleanup, waiting, reporting.
- You find that an existing rule is wrong, outdated, or leads to bad code.
- A fix in one place reveals the same flawed pattern elsewhere in the code.

What to do:

1. Search for every mention of the old name or pattern:
   `grep -rn "<name or pattern>" AGENTS.md docs/ .claude/ README.md src/ tests/ features/`.
2. Update the one place where the rule lives (the guide for the task, see the table at the top) and
   remove or fix stale mentions elsewhere. Do not add a second copy of a rule.
3. Prefer enforcing a rule with tooling (lint rule, type, CI check) over adding prose. When you add
   such a check, delete the prose it replaces and mention the check in one line.
4. If the same flawed pattern exists elsewhere in the code, fix it too, or list it in your report.
5. In your final report, name the instructions you changed and why.

## Verification before you finish

```bash
npm run verify    # typecheck, lint, step catalog check, Chromium suite, Cucumber
```

For a new or changed test, also check that it is stable on the live site:
`npx playwright test -g "TSxx" --project=chromium --repeat-each=3`. CI runs all three browsers;
locally Chromium (plus Firefox for changes in `src/core/` or the config) is enough.

Before finishing, also run through [Keep the instructions in sync](#keep-the-instructions-in-sync).
If a test fails because of the live site and not your change, say so explicitly instead of
weakening the assertion.

## Boundaries

- **Do:** keep changes small and focused, follow the existing naming and comment style, update
  `README.md` when you change commands or structure.
- **Ask first:** adding or upgrading dependencies (then run `npx playwright install`), changing
  `playwright.config.ts`, `cucumber.yml`, `tsconfig.json` or the CI workflow.
- **Don't:** edit generated reports or `docs/steps-catalog.md` by hand, delete or skip existing tests
  to make the suite green.

## CI

`.github/workflows/playwright.yml` runs on push/PR to `main`:

- `static`: `npm run typecheck`, `npm run lint` and `npm run steps -- --check`. The test jobs depend on it.
- `playwright`: a matrix job per browser (`--project=chromium|firefox|webkit`), 1 retry on CI,
  default workers (`fullyParallel`). Reporters `github`, `list`, `html`, `junit`. Uploads
  `playwright-report/` always and `test-results/` (traces, screenshots, videos) on failure.
- `cucumber`: `npm run test:cucumber` in Chromium, uploads `test-results/`.

A retried test that passes is reported as flaky. Treat flaky tests as bugs to fix, not as green.
