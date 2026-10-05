---
name: implement-scenario
description: Implement a Gherkin scenario the user wrote by hand (tagged @new or with undefined steps) - step definitions, AutomationExerciseApp methods, locators and the twin Playwright spec, verified against the live site. Use when the user asks to implement, automate or "make runnable" a .feature file or scenario.
argument-hint: "[path/to/file.feature] [scenario name or tag]"
---

Implement the Gherkin scenario(s) given in: $ARGUMENTS

If no file is given, take the scenarios tagged `@new` in `features/automation-exercise/`, or else the
ones with undefined steps (`npx cucumber-js --dry-run`). If it is still unclear, ask the user.

Follow `docs/agents/implementing-scenarios.md` step by step; it lists what else to read.
