import { Given, Then, When } from '@cucumber/cucumber';
import { expectTextVisible } from '@/core/web-core';
import type { AutomationExerciseWorld } from '../support/world';

Given('I start at the Automation Exercise home page', async function (this: AutomationExerciseWorld) {
  await this.ae.startAtHome();
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
