---
name: implement-scenario
description: Implement a Gherkin scenario the user wrote by hand (tagged @new or with undefined steps) - step definitions, AutomationExerciseApp methods, locators and the twin Playwright spec, verified against the live site. Use when the user asks to implement, automate or "make runnable" a .feature file or scenario.
argument-hint: "[path/to/file.feature] [scenario name or tag]"
---

Implement the Gherkin scenario(s) given in: $ARGUMENTS

If no file is given, find scenarios tagged `@new` in `features/automation-exercise/` (and, failing
that, run `npx cucumber-js --dry-run` and take the scenarios with undefined steps). If that still
leaves it unclear what to implement, ask the user.

Follow `docs/agents/implementing-scenarios.md` step by step. Read these first:

- `docs/agents/implementing-scenarios.md` – the procedure (review, mapping, inspect, implement, tag, verify, report)
- `docs/agents/writing-tests.md` – spec and Gherkin rules, the spec ↔ feature mapping
- `docs/agents/writing-functions.md` – rules for app methods, locators and utilities
- `npm run steps` – catalog of existing steps to reuse

Key points:

- The user's Gherkin is the specification. Do not change its wording without asking. Ask before
  coding when a step is ambiguous.
- Use `npm run inspect -- <path>` on the live page before writing any new locator.
- One Gherkin step = one step definition = one `ae.*` call, and the twin spec has the same steps in
  the same order.
- Replace `@new` with `@TSxx` (+ `@TCxx` for test cases from https://automationexercise.com/test_cases).
- Finish with the verification commands from the procedure and the report: mapping table, changed
  files, Gherkin suggestions, test results.
