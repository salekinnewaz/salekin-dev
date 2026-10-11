/**
 * BasePage
 *
 * Shared base for all Page Object classes. Holds the Playwright
 * `Page` reference and exposes the most generic locator used
 * across the suite: the `<main>` landmark.
 *
 * Subclasses add their own selectors and flows. Selectors are
 * private (or protected at most) — specs are expected to call
 * named methods rather than reach into the locator. This is the
 * "strict" Page Object style: methods-only.
 */
import type { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** The first `<main>` landmark on the page. */
  protected get main(): Locator {
    return this.page.locator('main').first();
  }

  /**
   * Navigate to a URL and wait for the page's primary landmark to
   * be visible. Subclasses call this from a `goto(path)` method
   * that knows the right URL.
   */
  protected async openAt(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.main.waitFor({ state: 'visible' });
  }

  /**
   * Wait for the page's primary landmark to be visible. Useful
   * when a spec navigates some other way (e.g. form submission)
   * and just needs to assert the page is ready.
   */
  async waitForReady(): Promise<void> {
    await this.main.waitFor({ state: 'visible' });
  }
}
