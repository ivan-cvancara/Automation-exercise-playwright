# Writing scenarios for the agent

Workflow: **you write a Gherkin scenario, the agent creates everything else**: step definitions,
methods in `AutomationExerciseApp`, locators and the twin Playwright spec, and verifies both against
the live site.

## 1. Where to write it

- Into an existing file in `features/automation-exercise/` when it belongs to that area
  (`auth`, `catalog`, `cart`).
- Into a new file `features/automation-exercise/<area>.feature` for a new area (e.g.
  `contact.feature`). Start from the [template](scenario-template.feature).
- Tag every new scenario with **`@new`**. The agent replaces it with the IDs (`@TSxx @TCxx`).

## 2. How to write it

- **Check the [step catalog](steps-catalog.md) first.** If a step exists, use its exact wording.
  `{string}` = text in double quotes (`"Blue Top"`), `{int}` = whole number (`4`).
- Write it like a manual test case: each line is one thing a person does or checks, in the order
  they do it.
  - `Given` = starting state and test data, `When` = user action, `Then` = what the user sees.
  - Put a check (`Then`) where a person would look, not only at the end.
  - One step = one action. Not `When I register and log in`, but two steps.
- Write concrete values directly into the step (`"Blue Top"`, `4`); use a data table for several
  values at once (see the template).
- No selectors, URLs or waits. Describe what the user sees ("the cart page"), not the HTML.
- If the scenario creates something (an account), it also deletes it at the end.
- If the scenario matches a test case on https://automationexercise.com/test_cases, mention its
  number in a comment (e.g. `# Test Case 6`). The agent uses it for the `@TC06` tag.

For inspiration see [auth.feature](../features/automation-exercise/auth.feature) and
[cart.feature](../features/automation-exercise/cart.feature).

## 3. Hand it over to the agent

In Claude Code:

```
/implement-scenario features/automation-exercise/contact.feature
```

Or in plain words: "Implement the @new scenarios in contact.feature." The agent follows
[docs/agents/implementing-scenarios.md](agents/implementing-scenarios.md):

1. Reviews the scenario. It asks when a step is ambiguous; other suggestions go into the final
   report, it does not change your wording on its own.
2. Finds an existing implementation for each step or writes a new one (based on the live page).
3. Creates the Playwright test with the same structure and replaces `@new` with `@TSxx @TCxx`.
4. Runs the scenario and the Playwright test and refreshes the [step catalog](steps-catalog.md).
5. Reports a "step → step definition → method" table and the test results.

## Useful commands

```bash
npm run steps                         # print the catalog of existing steps
npx cucumber-js --dry-run <file>      # show steps that are not implemented yet
npx cucumber-js --tags @TS6           # run one scenario
npm run inspect -- /contact_us        # roles and elements of a live page (for locators)
```
