import { test as base } from '@playwright/test';
import { AutomationExerciseApp } from '@/sites/automation-exercise/automation-exercise.app';

export const test = base.extend<{ ae: AutomationExerciseApp }>({
  ae: async ({ page }, use) => {
    await use(new AutomationExerciseApp(page));
  },
});

export { expect } from '@playwright/test';

/** Mirrors Robot `Start Test` + home assertion (without JSON user bind). */
export async function startAtAutomationExerciseHome(ae: AutomationExerciseApp): Promise<void> {
  await ae.openHome();
  await ae.acceptCookieConsent();
  await ae.expectHomePage();
}
