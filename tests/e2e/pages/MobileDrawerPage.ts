/**
 * MobileDrawerPage
 *
 * The mobile-only navigation drawer. Only the hamburger is
 * visible ≤640px; clicking it toggles `#mobile-drawer[data-open]`
 * on/off. ESC and the scrim both close it.
 *
 * The hamburger's `aria-label` flips between "Open menu" and
 * "Close menu" depending on state — we locate it by the stable
 * `aria-controls` + class so the locator survives the re-render.
 */
import { expect, type Locator } from '@playwright/test';
import { HeaderPage } from './HeaderPage';

export class MobileDrawerPage extends HeaderPage {
  get hamburger(): Locator {
    return this.page.locator(
      'button.hamburger[aria-controls="mobile-drawer"]',
    );
  }

  get drawer(): Locator {
    return this.page.locator('#mobile-drawer');
  }

  get scrim(): Locator {
    return this.page.locator('#mobile-drawer .drawer__scrim');
  }

  // ── Flows ────────────────────────────────────────────────────────

  async expectHamburgerVisibleAndDrawerClosed(): Promise<void> {
    await expect(this.hamburger).toBeVisible();
    await expect(this.drawer).toBeAttached();
    await expect(this.drawer).not.toHaveAttribute('data-open', 'true');
  }

  async expectHamburgerLabelSaysOpen(): Promise<void> {
    await expect(this.hamburger).toHaveAttribute('aria-label', /open menu/i);
  }

  async open(): Promise<void> {
    await this.hamburger.click();
    await expect(this.drawer).toHaveAttribute('data-open', 'true');
    await expect(this.hamburger).toHaveAttribute('aria-label', /close menu/i);
  }

  async closeViaEsc(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.drawer).not.toHaveAttribute('data-open', 'true');
  }

  async closeViaScrim(): Promise<void> {
    await this.scrim.click();
    await expect(this.drawer).not.toHaveAttribute('data-open', 'true');
  }
}
