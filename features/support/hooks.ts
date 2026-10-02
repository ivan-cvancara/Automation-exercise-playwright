import { After, AfterAll, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, type Browser } from '@playwright/test';
import { AUTOMATION_EXERCISE_BASE } from '@/config/env';
import { AutomationExerciseApp } from '@/sites/automation-exercise/automation-exercise.app';
import type { AutomationExerciseWorld } from './world';

// Cucumber's default is 5 s per step; flow steps (e.g. full registration) on the live site take longer.
// 30 s matches the Playwright Test default per test.
setDefaultTimeout(30_000);

let browser: Browser;

BeforeAll(async () => {
  browser = await chromium.launch();
});

Before(async function (this: AutomationExerciseWorld) {
  this.context = await browser.newContext({ baseURL: AUTOMATION_EXERCISE_BASE });
  this.page = await this.context.newPage();
  this.ae = new AutomationExerciseApp(this.page);
});

After(async function (this: AutomationExerciseWorld) {
  await this.context?.close();
});

AfterAll(async () => {
  await browser?.close();
});
