import { Then, When } from '@cucumber/cucumber';
import type { AutomationExerciseWorld } from '../support/world';

When('I subscribe in the footer with email {string}', async function (this: AutomationExerciseWorld, email: string) {
  await this.ae.scrollToFooterAndSubscribe(email);
});

Then('I should see the subscription success message', async function (this: AutomationExerciseWorld) {
  await this.ae.expectSubscribedMessage();
});
