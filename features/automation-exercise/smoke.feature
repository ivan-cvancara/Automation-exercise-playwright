Feature: Automation Exercise smoke (Cucumber)
  Minimal check that Playwright + Gherkin wiring works against the demo shop.

  Scenario: Home page loads
    Given I start at the Automation Exercise home page
    Then I should see the Automation Exercise home page

  Scenario: Home page shows brand in the header
    Given I start at the Automation Exercise home page
    Then I should see the text "AutomationExercise"