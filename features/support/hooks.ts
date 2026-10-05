import * as path from 'node:path';
import { After, AfterAll, Before, BeforeAll, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { chromium, firefox, webkit, type Browser, type BrowserType } from '@playwright/test';
import { AUTOMATION_EXERCISE_BASE } from '@/config/env';
import { AutomationExerciseApp } from '@/sites/automation-exercise/automation-exercise.app';
import type { AutomationExerciseWorld } from './world';

// Cucumber's default is 5 s per step; flow steps (e.g. full registration) on the live site take longer.
// 30 s matches the Playwright Test default per test.
setDefaultTimeout(30_000);

const BROWSERS: Record<string, BrowserType> = { chromium, firefox, webkit };
const TRACES_DIR = 'test-results/cucumber-traces';

let browser: Browser;

BeforeAll(async () => {
  // `BROWSER=firefox npm run test:cucumber`; Chromium by default.
  const name = process.env.BROWSER ?? 'chromium';
  const browserType = BROWSERS[name];
  if (!browserType) {
    throw new Error(`Unknown BROWSER "${name}". Use one of: ${Object.keys(BROWSERS).join(', ')}`);
  }
  browser = await browserType.launch();
});

Before(async function (this: AutomationExerciseWorld) {
  this.context = await browser.newContext({ baseURL: AUTOMATION_EXERCISE_BASE });
  await this.context.tracing.start({ screenshots: true, snapshots: true });
  this.page = await this.context.newPage();
  this.ae = new AutomationExerciseApp(this.page);
});

// Same artefacts as Playwright Test on failure: a screenshot in the HTML report and a trace file
// (`npx playwright show-trace <file>`).
After(async function (this: AutomationExerciseWorld, { pickle, result }) {
  if (result?.status === Status.FAILED) {
    this.attach(await this.page.screenshot({ fullPage: true }), 'image/png');
    const traceFile = path.join(TRACES_DIR, `${pickle.name.replace(/[^\w-]+/g, '_')}.zip`);
    await this.context.tracing.stop({ path: traceFile });
    this.log(`Trace: ${traceFile}`);
  } else {
    await this.context.tracing.stop();
  }
  await this.context.close();
});

AfterAll(async () => {
  await browser?.close();
});
