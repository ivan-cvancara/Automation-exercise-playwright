/**
 * Opens an Automation Exercise page and prints what is needed to design locators:
 * title, URL, the accessibility (ARIA) snapshot and all form controls / `data-qa` elements.
 * Used by agents before adding locators, so they are based on the live page, not guessed.
 *
 *   npm run inspect -- /contact_us
 *   npm run inspect -- /products --scope ".features_items"
 *   npm run inspect -- https://example.com --headed
 */
import { chromium } from '@playwright/test';
import { AUTOMATION_EXERCISE_BASE } from '@/config/env';
import { AutomationExerciseApp } from '@/sites/automation-exercise/automation-exercise.app';

type Args = { target: string; scope: string; headed: boolean };

function parseArgs(argv: string[]): Args {
  const scopeIndex = argv.indexOf('--scope');
  const scope = scopeIndex >= 0 ? argv[scopeIndex + 1] : 'body';
  const target = argv.find((arg, i) => !arg.startsWith('--') && i !== scopeIndex + 1) ?? '/';
  return { target, scope, headed: argv.includes('--headed') };
}

async function main(): Promise<void> {
  const { target, scope, headed } = parseArgs(process.argv.slice(2));
  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext({ baseURL: AUTOMATION_EXERCISE_BASE });
  const page = await context.newPage();

  try {
    await page.goto(target, { waitUntil: 'domcontentloaded' });
    await new AutomationExerciseApp(page).acceptCookieConsent();

    const root = page.locator(scope).first();
    console.log(`# ${await page.title()}\nURL: ${page.url()}\nScope: ${scope}\n`);

    console.log('## ARIA snapshot (use for getByRole / getByText)\n');
    console.log(await root.ariaSnapshot());

    console.log('\n## Form controls and data-qa elements\n');
    const controls = await root.locator('[data-qa], input, select, textarea, button').evaluateAll((elements) =>
      elements.map((el) => {
        const attrs = ['data-qa', 'id', 'name', 'type', 'placeholder']
          .map((name) => [name, el.getAttribute(name)] as const)
          .filter(([, value]) => value)
          .map(([name, value]) => `${name}="${value}"`);
        const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
        return `<${el.tagName.toLowerCase()}> ${attrs.join(' ')}${text ? `  text="${text}"` : ''}`;
      }),
    );
    console.log(controls.length ? controls.join('\n') : '(none)');
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
