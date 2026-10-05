# Playwright training

E2E tests in TypeScript for the demo shop [Automation Exercise](https://automationexercise.com),
built on [Playwright Test](https://playwright.dev/) and [Cucumber.js](https://github.com/cucumber/cucumber-js).
Every test exists twice with the same steps: as a Playwright spec and as a Gherkin scenario.
Both use the same page layer in `src/`.

## Setup

Requires Node.js LTS.

```bash
npm install
npx playwright install    # download browsers (once, and after a Playwright upgrade)
```

## How to work with the project

**Adding a test (main workflow)**

1. Write a Gherkin scenario in `features/automation-exercise/<area>.feature` and tag it `@new`.
   Start from [docs/scenario-template.feature](docs/scenario-template.feature) and reuse steps from
   [docs/steps-catalog.md](docs/steps-catalog.md).
2. Let the agent implement it. In Claude Code:
   `/implement-scenario features/automation-exercise/<area>.feature`.
   It adds step definitions, page methods, locators and the twin Playwright spec, and runs both.
3. Review the changes and the agent's report, then commit.

Rules for writing scenarios: [docs/writing-scenarios.md](docs/writing-scenarios.md).

**Writing code by hand**: follow [AGENTS.md](AGENTS.md) and the guides in [docs/agents/](docs/agents/).
In short, tests read like a manual test case, one line = one user step. Selectors live only in
`locators.ts`, page behaviour in `AutomationExerciseApp`.

**In VS Code**: install the required extensions listed in [.vscode/extensions.json](.vscode/extensions.json)
(Playwright Test, Cucumber). VS Code offers them when you open the project, or find them under
`@recommended` in the Extensions view. Playwright tests then show up in the *Testing* tab. Run them
from there, with *Show browser* for headed mode.

## Commands

| Command | What it does |
|---------|--------------|
| `npm run test:ae -- --project=chromium` | All Automation Exercise specs in Chromium (fast local run) |
| `npx playwright test <file> -g "TS9"` | One spec file / one test by title |
| `npx playwright test <file> --headed` | Run with a visible browser |
| `npm run test:ui` | Playwright UI mode: pick tests, timeline, DOM snapshots |
| `npm test` | Full Playwright suite in Chromium, Firefox and WebKit (CI runs one job per browser) |
| `npm run report` | Open the last Playwright HTML report |
| `npm run test:cucumber` | All Gherkin scenarios (headless Chromium, 2 parallel workers) |
| `BROWSER=firefox npm run test:cucumber` | Gherkin scenarios in another browser (`chromium`, `firefox`, `webkit`) |
| `npx cucumber-js --tags @TS9` | One scenario or area by tag (`@auth`, `@catalog`, `@cart`) |
| `npx cucumber-js --dry-run` | Check that every Gherkin step has a definition, without running |
| `npm run steps` | Print the catalog of existing steps (`-- --write` updates `docs/steps-catalog.md`, `-- --check` verifies it) |
| `npm run inspect -- /contact_us` | Print roles and form elements of a live page, for writing locators |
| `npm run typecheck` | Type check the whole project (`tsc --noEmit`) |
| `npm run lint` | ESLint: missing `await`, `waitForTimeout`, `force: true`, selectors in specs and steps |
| `npm run verify` | Everything to run before a commit: typecheck, lint, step catalog check, Chromium suite, Cucumber |
| `BASE_URL=https://... npm test` | Run against another host than the public Automation Exercise site |

## Structure

```
features/
  automation-exercise/*.feature   Gherkin scenarios, twins of the specs (auth, catalog, cart)
  step_definitions/*.steps.ts     Step definitions by page/area, each calls one `ae` method
  support/                        Cucumber World and hooks (browser lifecycle)
tests/
  automation-exercise/*.spec.ts   Playwright specs, same steps as the features
  fixtures/                       `test` with the `ae` fixture
src/
  sites/automation-exercise/      locators.ts (selectors) + automation-exercise.app.ts (page steps)
  core/web-core.ts                Generic site-independent helpers (kept minimal)
  data/                           Test users (users.json) and loaders
  utils/                          Pure formatting and conversion helpers (prices)
  config/env.ts                   Base URL (overridable with BASE_URL)
  config/browser.ts               Devices and timeouts shared by both runners
docs/                             Guides, scenario template, step catalog
scripts/                          Step catalog and page inspector
```

Test IDs: `TSxx` in test titles and scenario names, tag `@TCxx` = number of the test case on
https://automationexercise.com/test_cases.

## CI

GitHub Actions ([.github/workflows/playwright.yml](.github/workflows/playwright.yml)) runs on every push
and pull request to `main`:

1. **Type check, lint and step catalog** (`npm run typecheck`, `npm run lint`, `npm run steps -- --check`).
   The test jobs start only when this passes.
2. **Playwright**, one parallel job per browser (Chromium, Firefox, WebKit), 1 retry. Retried tests are
   reported as *flaky*. Uploads the HTML report, and traces, screenshots and videos of failed tests.
3. **Cucumber** in Chromium. Uploads the HTML report, JUnit XML and traces of failed scenarios.

The tests run against a live public site. A failure can be caused by a change on the site, not
only by the code.
