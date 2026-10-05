# Implementing a Gherkin scenario written by the user

The usual workflow in this repo: **the user writes a Gherkin scenario by hand, the agent implements
everything else** (step definitions, app methods, locators, utilities, the twin Playwright spec)
and verifies it against the live site.

The user's Gherkin is the specification. Implement what it says, in the order it says it.

Before you start, read [writing-tests.md](writing-tests.md), [writing-functions.md](writing-functions.md)
and the current step catalog (`npm run steps`).

## Input

- A `.feature` file in `features/automation-exercise/`, either a new file or a new scenario in an
  existing one.
- New, not yet implemented scenarios are tagged **`@new`**. If the user names a file or scenario
  without the tag, implement the scenarios that have undefined steps
  (`npx cucumber-js --dry-run <file>` lists them).

## Procedure

### 1. Understand the scenario

- Read the scenario and the feature it belongs to (Feature name, Background, neighbouring scenarios).
- If it corresponds to a test case on https://automationexercise.com/test_cases, read that test case
  and use it to fill gaps (what exactly to verify), never to override the user's steps.
- Decide the twin spec: `features/automation-exercise/<area>.feature` ↔
  `tests/automation-exercise/<area>.spec.ts`. A new feature file means a new spec file.

### 2. Review the Gherkin before writing code

Check the scenario against the Cucumber rules in [writing-tests.md](writing-tests.md#cucumber-scenarios).
Look for:

| Problem | Example | What to do |
|---------|---------|------------|
| Step means the same as an existing catalog step, but is worded differently | `When I go to the products page` vs. existing `I open all products` | Propose the existing wording |
| Step hides several user actions | `When I register and log in` | Propose splitting it |
| Step is ambiguous | `Then I see the result` | **Ask** what exactly is checked |
| Check is missing where a human would look | an action followed by another action on a different page | Propose a `Then` step |
| Data the scenario creates is not cleaned up | account registered, never deleted | Propose cleanup steps |
| Technical details in Gherkin | selectors, URLs, waits | Propose business wording |

Rules:

- **Do not silently change the user's wording.** Ambiguous steps block the work: ask first.
  Other findings: implement the scenario as written and list your suggestions in the final report,
  unless the fix is needed to reuse an existing step (then ask).
- You may change, without asking: tags (`@new` → IDs, see step 6), the header comment of the
  feature file, indentation and obvious typos in Gherkin keywords.

### 3. Map every step

Make a mapping table before coding (it goes into the final report as well):

| Gherkin step | Step definition | `ae` method |
|--------------|-----------------|-------------|
| `When I open all products` | existing, `products.steps.ts` | existing `openAllProducts()` |
| `When I fill in the contact form with name {string} ...` | **new**, `contact.steps.ts` | **new** `fillContactForm(...)` |

- Reuse existing step definitions and app methods whenever the meaning is the same.
- One step definition calls one `ae` method. A new step usually means a new app method.
- A `{string}` or `{int}` parameter is better than a new step for every value.

### 4. Inspect the live page

For every new interaction or check, look at the real page before writing a locator:

```bash
npm run inspect -- /contact_us                       # whole page
npm run inspect -- /products --scope ".features_items" # only a part of it
```

It prints the ARIA snapshot (roles, accessible names, texts) and all form controls with `data-qa`,
`id`, `name` and `placeholder`. Choose locators by the priority in
[writing-functions.md](writing-functions.md#locators-locatorsts). Never guess a selector.

### 5. Implement bottom-up

1. **Locators** in `src/sites/automation-exercise/locators.ts`.
2. **App methods** in `AutomationExerciseApp`, named and shaped by
   [writing-functions.md](writing-functions.md). Formatting or conversion logic goes to `src/utils/`.
3. **Test data**, if the scenario refers to a key in `src/data/users.json` that does not exist yet.
4. **Step definitions** in `features/step_definitions/<area>.steps.ts` (create the file for a new
   area). One `this.ae.*` call per step, values to remember go to the World.
5. **Twin Playwright spec**: translate the scenario line by line using the mapping table in
   [writing-tests.md](writing-tests.md#features-mirror-the-playwright-specs):
   - `Feature` name → `test.describe` name, `Scenario` name → test title,
   - `Background` steps → data and start phase of every test,
   - each Gherkin step → one `ae.*` call, in the same order, phases separated by blank lines,
   - values written in Gherkin → named constants in the data phase.

### 6. Tag and name

- Replace `@new` with `@TSxx` and, when the scenario implements a test case from the AE list,
  `@TCxx` (`xx` = the test case number). For a scenario that is not on the AE list use the next free
  number from `TS101` up and no `@TC` tag.
- Make sure the Scenario name starts with the same ID: `Scenario: TS6 - contact us form is submitted`.
  The Playwright test title is identical.
- A new feature file gets the header comment used in the other features
  (`# Mirrors tests/automation-exercise/<area>.spec.ts ...`) and a feature tag (`@contact`).

### 7. Verify

```bash
npm run typecheck
npm run lint
npx cucumber-js --dry-run                                  # no undefined or ambiguous steps
npx cucumber-js --tags @TSxx                               # the new scenario
npx playwright test tests/automation-exercise --project=chromium -g "TSxx"   # its twin
npm run steps -- --write                                   # refresh docs/steps-catalog.md
```

If you changed existing app methods or locators, also run the full checks from
[AGENTS.md](../../AGENTS.md#verification-before-you-finish). Run every new test at least twice.
The site is live, and one green run does not prove the test is stable.

### 8. Report

End with a short report to the user:

- the mapping table (step → step definition → `ae` method, marked *new* / *reused*),
- files changed,
- suggestions for the Gherkin from step 2 (if any), as concrete rewritten lines,
- test results of both runners. If something fails because of the live site, say so.
