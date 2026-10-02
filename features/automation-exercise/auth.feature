# Mirrors tests/automation-exercise/auth.spec.ts (one scenario per test, same order of steps).
# Source test cases: https://automationexercise.com/test_cases (Test Case 1-5).
@auth
Feature: Authentication & signup (Automation Exercise)

  Background:
    Given a new user from test data "TC01 Register User" with a unique email
    And I start at the Automation Exercise home page

  @TS1 @TC01
  Scenario: TC01 / TS1 - register user, then delete account
    When I register the new user
    And I delete the account
    Then the account should be deleted

  @TS2 @TC02
  Scenario: TS2 - login with correct email and password, then delete
    When I register the new user
    And I log out
    Then I should see the login form
    When I log in with the user's email and password
    Then I should be logged in
    When I delete the account
    Then the account should be deleted

  @TS3 @TC03
  Scenario: TS3 - wrong password shows error; correct password then cleanup
    When I register the new user
    And I log out
    Then I should see the login form
    When I log in with the user's email and password "definitely-wrong-password"
    Then I should see the login error
    When I log in with the user's email and password
    Then I should be logged in
    When I delete the account
    Then the account should be deleted

  @TS4 @TC04
  Scenario: TS4 - logout returns to login route
    When I register the new user
    And I log out
    Then I should be on the login page

  @TS5 @TC05
  Scenario: TS5 - signup with existing email
    When I register the new user
    And I log out
    Then I should see the new user signup form
    When I fill in the signup form with the user's name and email
    And I submit the signup form
    Then I should see that the email address already exists
