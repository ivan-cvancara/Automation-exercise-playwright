# Mirrors tests/automation-exercise/cart.spec.ts (one scenario per test, same order of steps).
# Source test cases: https://automationexercise.com/test_cases (Test Case 12-13, first part of 14).
@cart
Feature: Cart & checkout smoke (Automation Exercise)

  Background:
    Given I start at the Automation Exercise home page

  @TS12 @TC12
  Scenario: TS12 - add two products and verify cart rows
    When I open all products
    And I note the product at position 1 as "first product"
    And I note the product at position 2 as "second product"
    And I add the noted "first product" to the cart
    And I continue shopping
    And I add the noted "second product" to the cart
    And I continue shopping
    And I open the cart from the header
    Then I should see the cart page
    And the cart should contain the noted "first product" with quantity 1
    And the cart should contain the noted "second product" with quantity 1

  @TS13 @TC13
  Scenario: TS13 - quantity from product detail page
    When I open the details of product "Blue Top"
    Then I should see the product details page
    When I note the displayed price of "Blue Top"
    And I set the quantity to 4
    And I add the product to the cart from the detail page
    And I view the cart
    Then I should see the cart page
    And the cart should contain the noted "Blue Top" with quantity 4

  # Partial: covers only the "add products to cart and open the cart" part of Test Case 14.
  @TS14
  Scenario: TS14 - add named product to cart and open cart (checkout smoke)
    When I add product "Sleeveless Dress" to the cart
    And I continue shopping
    And I open the cart from the header
    Then I should see the cart page
