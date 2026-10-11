/**
 * FooterPage
 *
 * Placeholder. The site has a `<footer>` rendered on every page,
 * but no spec currently asserts on it. This Page Object exists
 * so the Header / Footer / SideNav chrome has a parallel
 * abstraction ready when a future test needs to inspect the
 * footer (copyright text, social links, etc.).
 */
import { BasePage } from './BasePage';

export class FooterPage extends BasePage {
  /** The site's `<footer>` element. */
  get root() {
    return this.page.locator('footer').first();
  }

  async expectVisible(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }
}