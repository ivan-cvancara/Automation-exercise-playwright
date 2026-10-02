import { setWorldConstructor, World, type IWorldOptions } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';
import type { TestUser } from '@/data/types';
import { AutomationExerciseApp, type ListedProduct } from '@/sites/automation-exercise/automation-exercise.app';

/**
 * Shared Cucumber world: Playwright handles browser lifecycle in hooks.ts.
 * Also keeps what a scenario "remembers" between steps (the test user, noted products),
 * which in Playwright specs are plain local variables.
 */
export class AutomationExerciseWorld extends World {
  context!: BrowserContext;
  page!: Page;
  ae!: AutomationExerciseApp;
  user?: TestUser;
  notedProducts: Record<string, ListedProduct> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  requireUser(): TestUser {
    if (!this.user) {
      throw new Error('No test user loaded. Add a "Given a new user from test data ..." step first.');
    }
    return this.user;
  }

  notedProduct(alias: string): ListedProduct {
    const product = this.notedProducts[alias];
    if (!product) {
      throw new Error(`No product noted as "${alias}". Add an "I note ..." step first.`);
    }
    return product;
  }
}

setWorldConstructor(AutomationExerciseWorld);
