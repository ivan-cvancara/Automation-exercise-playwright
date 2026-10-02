import { Given, Then, When } from '@cucumber/cucumber';
import { expectTextVisible } from '@/core/web-core';
import { startAtAutomationExerciseHome } from '../../tests/fixtures/automation-exercise.fixture';
import type { AutomationExerciseWorld } from '../support/world';

Given('I start at the Automation Exercise home page', async function (this: AutomationExerciseWorld) {
  await startAtAutomationExerciseHome(this.ae);
});

Then('I should see the Automation Exercise home page', async function (this: AutomationExerciseWorld) {
  await this.ae.expectHomePage();
});

Then('I should see the text {string}', async function (this: AutomationExerciseWorld, text: string) {
  await expectTextVisible(this.page, text);
});

When('I open the Test Cases page', async function (this: AutomationExerciseWorld) {
  await this.ae.openTestCasesPage();
});

Then('I should see the Test Cases page', async function (this: AutomationExerciseWorld) {
  await this.ae.expectTestCasesPageTitle();
});
