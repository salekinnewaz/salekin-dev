/**
 * AdminDashboardPage
 *
 * `/admin` after a successful login. Renders the main admin UI
 * (a `<main>` landmark with the messages / settings controls).
 * The spec just confirms the user is no longer on the login
 * page and the dashboard chrome is mounted.
 */
import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminDashboardPage extends BasePage {
  /** Wait for the URL to leave `/admin/login`. */
  async waitForArrival(timeout = 10_000): Promise<void> {
    await this.page.waitForURL(/\/admin(\/(?!login).*|$)/, { timeout });
    expect(this.page.url()).not.toMatch(/\/admin\/login/);
  }

  get main(): Locator {
    return this.page.locator('main');
  }

  async expectRendered(): Promise<void> {
    await expect(this.main).toBeVisible();
  }
}