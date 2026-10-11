/**
 * NotFoundPage
 *
 * Rendered for any unmatched route. Should include the site
 * chrome (Header + Footer) and a not-found / 404 message.
 */
import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { expectBodyContainsIgnoreCase } from '../utils/assertions';

export class NotFoundPage extends BasePage {
  /**
   * Navigate to an unknown route. The site either serves a 404
   * (dev) or the static fallback 200 (prod) — we don't assert on
   * the HTTP code, just on the visible not-found copy.
   */
  async goto(path = '/this-route-does-not-exist'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.main.waitFor({ state: 'visible' });
  }

  get headerBrand(): Locator {
    return this.page.getByRole('banner');
  }

  async expectRendered(): Promise<void> {
    await expect(this.main).toBeVisible();
    // The Header always renders the brand.
    await expect(this.headerBrand).toBeVisible();
    // Some flavour of "not found" / "404" is in the body.
    await expectBodyContainsIgnoreCase(this.page, 'not found');
  }
}