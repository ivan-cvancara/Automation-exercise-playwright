# Template for a new scenario. Copy it to features/automation-exercise/<area>.feature
# (new file), or add just the scenario to an existing feature file.
# Guide: docs/writing-scenarios.md, catalog of existing steps: docs/steps-catalog.md
@contact
Feature: Contact us (Automation Exercise)

  Background:
    Given I start at the Automation Exercise home page

  # Test Case 6 (https://automationexercise.com/test_cases)
  # @new = not implemented yet. The agent replaces it with @TSxx @TCxx.
  @new
  Scenario: Contact us form is submitted with an attachment
    When I open the Contact Us page
    Then I should see the "Get In Touch" form
    When I fill in the contact form:
      | name    | Jan Novak             |
      | email   | jan.novak@example.com |
      | subject | Order question        |
      | message | Where is my order?    |
    And I attach the file "sample.txt"
    And I submit the contact form
    And I confirm the browser dialog
    Then I should see the contact success message
    When I go back to the home page
    Then I should see the Automation Exercise home page
