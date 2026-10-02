# Mirrors tests/automation-exercise/catalog.spec.ts (one scenario per test, same order of steps).
# Source test cases: https://automationexercise.com/test_cases (Test Case 7-11).
@catalog
Feature: Catalog, search, subscription (Automation Exercise)

  Background:
    Given I start at the Automation Exercise home page

  @TS7 @TC07
  Scenario: TS7 - test cases page title
    When I open the Test Cases page
    Then I should see the Test Cases page

  @TS8 @TC08
  Scenario: TS8 - products list and first product detail
    When I open all products
    Then I should see the All Products page
    When I open the details of the first product
    Then I should see the product details page
    And I should see the product information:
      | name     | Blue Top     |
      | category | Women > Tops |
      | price    | Rs. 500      |

  @TS9 @TC09
  Scenario: TS9 - search product lists matching cards
    When I open all products
    Then I should see the All Products page
    When I search for products "Blue"
    Then I should see the searched products
    And every search result should contain "Blue"

  @TS10 @TC10
  Scenario: TS10 - subscription in footer (home)
    When I subscribe in the footer with email "test.home@example.com"
    Then I should see the subscription success message

  @TS11 @TC11
  Scenario: TS11 - subscription in cart page
    When I open the cart from the header
    Then I should see the cart page
    When I subscribe in the footer with email "test.cart@example.com"
    Then I should see the subscription success message
