import { Given, Then, When } from '@cucumber/cucumber';
import { getUserByTestName, withUniqueEmail } from '@/data/user-loader';
import type { AutomationExerciseWorld } from '../support/world';

Given('a new user from test data {string} with a unique email', function (this: AutomationExerciseWorld, key: string) {
  const base = getUserByTestName(key);
  if (!base) {
    // Same as `test.skip(!base, ...)` in the Playwright spec.
    return 'skipped';
  }
  this.user = withUniqueEmail(base);
});

When('I register the new user', async function (this: AutomationExerciseWorld) {
  await this.ae.registerNewUserComplete(this.requireUser());
});

When('I log out', async function (this: AutomationExerciseWorld) {
  await this.ae.logout();
});

Then('I should see the login form', async function (this: AutomationExerciseWorld) {
  await this.ae.expectLoginForm();
});

Then('I should be on the login page', async function (this: AutomationExerciseWorld) {
  await this.ae.expectLoginPageTitleAfterLogout();
});

When("I log in with the user's email and password", async function (this: AutomationExerciseWorld) {
  const user = this.requireUser();
  await this.ae.submitLogin(user.email, user.password);
});

When("I log in with the user's email and password {string}", async function (this: AutomationExerciseWorld, password: string) {
  await this.ae.submitLogin(this.requireUser().email, password);
});

Then('I should see the login error', async function (this: AutomationExerciseWorld) {
  await this.ae.expectLoginError();
});

Then('I should be logged in', async function (this: AutomationExerciseWorld) {
  await this.ae.expectLoggedInText();
});

Then('I should see the new user signup form', async function (this: AutomationExerciseWorld) {
  await this.ae.expectNewUserSignup();
});

When("I fill in the signup form with the user's name and email", async function (this: AutomationExerciseWorld) {
  const user = this.requireUser();
  await this.ae.fillSignupNameAndEmail(`${user.firstName} ${user.lastName}`.trim(), user.email);
});

When('I submit the signup form', async function (this: AutomationExerciseWorld) {
  await this.ae.submitSignup();
});

Then('I should see that the email address already exists', async function (this: AutomationExerciseWorld) {
  await this.ae.expectEmailAlreadyExists();
});

When('I delete the account', async function (this: AutomationExerciseWorld) {
  await this.ae.clickDeleteAccount();
});

Then('the account should be deleted', async function (this: AutomationExerciseWorld) {
  await this.ae.expectAccountDeleted();
});
