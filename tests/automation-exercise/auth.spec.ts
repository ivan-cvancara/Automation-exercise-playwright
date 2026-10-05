import { getUserByTestName, withUniqueEmail } from '@/data/user-loader';
import { test } from '../fixtures/automation-exercise.fixture';

test.describe('Authentication & signup (Automation Exercise)', () => {
  test('TC01 / TS1 — register user, then delete account', async ({ ae }) => {
    const base = getUserByTestName('TC01 Register User');
    test.skip(!base, 'Add key TC01 Register User in src/data/users.json');
    const user = withUniqueEmail(base!);
    await ae.startAtHome();
    await ae.registerNewUserComplete(user);
    await ae.clickDeleteAccount();
    await ae.expectAccountDeleted();
  });

  test('TS2 — login with correct email and password, then delete', async ({ ae }) => {
    const base = getUserByTestName('TC01 Register User');
    test.skip(!base, 'Add key TC01 Register User in src/data/users.json');
    const user = withUniqueEmail(base!);
    await ae.startAtHome();
    await ae.registerNewUserComplete(user);
    await ae.logout();
    await ae.expectLoginForm();
    await ae.submitLogin(user.email, user.password);
    await ae.expectLoggedInText();
    await ae.clickDeleteAccount();
    await ae.expectAccountDeleted();
  });

  test('TS3 — wrong password shows error; correct password then cleanup', async ({ ae }) => {
    const base = getUserByTestName('TC01 Register User');
    test.skip(!base, 'Add key TC01 Register User in src/data/users.json');
    const user = withUniqueEmail(base!);
    await ae.startAtHome();
    await ae.registerNewUserComplete(user);
    await ae.logout();
    await ae.expectLoginForm();
    await ae.submitLogin(user.email, 'definitely-wrong-password');
    await ae.expectLoginError();
    await ae.submitLogin(user.email, user.password);
    await ae.expectLoggedInText();
    await ae.clickDeleteAccount();
    await ae.expectAccountDeleted();
  });

  test('TS4 — logout returns to login route', async ({ ae }) => {
    const base = getUserByTestName('TC01 Register User');
    test.skip(!base, 'Add key TC01 Register User in src/data/users.json');
    const user = withUniqueEmail(base!);
    await ae.startAtHome();
    await ae.registerNewUserComplete(user);
    await ae.logout();
    await ae.expectLoginPageTitleAfterLogout();
  });

  test('TS5 — signup with existing email', async ({ ae }) => {
    const base = getUserByTestName('TC01 Register User');
    test.skip(!base, 'Add key TC01 Register User in src/data/users.json');
    const user = withUniqueEmail(base!);
    await ae.startAtHome();
    await ae.registerNewUserComplete(user);
    await ae.logout();
    await ae.expectNewUserSignup();
    await ae.fillSignupNameAndEmail(`${user.firstName} ${user.lastName}`.trim(), user.email);
    await ae.submitSignup();
    await ae.expectEmailAlreadyExists();
  });
});
