import * as path from 'node:path';
import { After, AfterAll, Before, BeforeAll, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { chromium, firefox, webkit, type Browser, type BrowserType } from '@playwright/test';
import { ACTION_TIMEOUT, BROWSER_DEVICES, NAVIGATION_TIMEOUT, type BrowserName } from '@/config/browser';
import { AUTOMATION_EXERCISE_BASE } from '@/config/env';
import { AutomationExerciseApp } from '@/sites/automation-exercise/automation-exercise.app';
import type { AutomationExerciseWorld } from './world';

// Cucumber's default is 5 s per step; flow steps (e.g. full registration) on the live site take longer.
// 30 s matches the Playwright Test default per test.
setDefaultTimeout(30_000);

const BROWSERS: Record<BrowserName, BrowserType> = { chromium, firefox, webkit };
const TRACES_DIR = 'test-results/cucumber-traces';

// `BROWSER=firefox npm run test:cucumber`; Chromium by default.
const browserName = (process.env.BROWSER ?? 'chromium') as BrowserName;
let browser: Browser;

BeforeAll(async () => {
  if (!Object.hasOwn(BROWSERS, browserName)) {
    throw new Error(`Unknown BROWSER "${browserName}". Use one of: ${Object.keys(BROWSERS).join(', ')}`);
  }
  browser = await BROWSERS[browserName].launch();
});

// Same browser setup as the Playwright projects (device, timeouts), see src/config/browser.ts.
Before(async function (this: AutomationExerciseWorld) {
  this.context = await browser.newContext({ ...BROWSER_DEVICES[browserName], baseURL: AUTOMATION_EXERCISE_BASE });
  this.context.setDefaultTimeout(ACTION_TIMEOUT);
  this.context.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);
  await this.context.tracing.start({ screenshots: true, snapshots: true });
  this.page = await this.context.newPage();
  this.ae = new AutomationExerciseApp(this.page);
});

// Same artefacts as Playwright Test on failure: a screenshot in the HTML report and a trace file
// (`npx playwright show-trace <file>`). The context is always closed, even when saving them fails.
After(async function (this: AutomationExerciseWorld, { pickle, result }) {
  // `Before` failed before creating the context; Cucumber already reports that error.
  if (!this.context) {
    return;
  }
  try {
    if (result?.status === Status.FAILED) {
      // Best effort: a crashed page cannot take a screenshot, the trace below still shows what happened.
      try {
        this.attach(await this.page.screenshot({ fullPage: true }), 'image/png');
      } catch (error) {
        this.log(`Screenshot failed: ${String(error)}`);
      }
      const traceFile = path.join(TRACES_DIR, `${pickle.name.replace(/[^\w-]+/g, '_')}.zip`);
      await this.context.tracing.stop({ path: traceFile });
      this.log(`Trace: ${traceFile}`);
    } else {
      await this.context.tracing.stop();
    }
  } finally {
    await this.context.close();
  }
});

AfterAll(async () => {
  await browser?.close();
});
