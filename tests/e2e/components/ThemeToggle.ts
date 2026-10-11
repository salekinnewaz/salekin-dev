/**
 * ThemeToggle
 *
 * Cross-page component (in the Header). Three modes:
 *   - light
 *   - dark
 *   - system
 *
 * Two UI affordances:
 *   - The main button (a `getByRole('button', { name: ... })`
 *     matching /toggle theme|click to toggle/i) flips
 *     dark ↔ light directly.
 *   - A menu trigger (`/theme options/i`) opens a menu with
 *     three `role="menuitemradio"` choices.
 *
 * Choice persists in `localStorage["theme"]`; `<html data-theme>`
 * reflects the resolved value.
 */
import { expect, type Locator, type Page } from '@playwright/test';

export type ThemeMode = 'light' | 'dark' | 'system';

export class ThemeToggle {
  constructor(private readonly page: Page) {}

  get mainButton(): Locator {
    return this.page
      .getByRole('button', { name: /toggle theme|click to toggle/i })
      .first();
  }

  get menuTrigger(): Locator {
    return this.page.getByRole('button', { name: /theme options/i });
  }

  private menuItem(mode: ThemeMode): Locator {
    return this.page.getByRole('menuitemradio', {
      name: new RegExp(`^${mode}$`, 'i'),
    });
  }

  get html(): Locator {
    return this.page.locator('html');
  }

  // ── Flows ────────────────────────────────────────────────────────

  /** Pick a mode via the menu (Light / Dark / System). */
  async pick(mode: ThemeMode): Promise<void> {
    await this.menuTrigger.click();
    await this.menuItem(mode).click();
  }

  /**
   * Flip dark → light (or light → dark) via the main toggle
   * button. Useful for the test that asserts the main button
   * round-trips the two non-system modes.
   */
  async flipMainToggle(): Promise<void> {
    await this.mainButton.click();
  }

  async expectDataTheme(value: 'light' | 'dark'): Promise<void> {
    await expect(this.html).toHaveAttribute('data-theme', value);
  }

  async expectDataThemeIsOneOf(values: ReadonlyArray<'light' | 'dark'>): Promise<void> {
    const dataTheme = await this.html.getAttribute('data-theme');
    expect(values).toContain(dataTheme);
  }

  async expectLocalStorageMode(mode: ThemeMode): Promise<void> {
    const stored = await this.page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe(mode);
  }

  async reloadAndExpectLocalStorageIntact(mode: ThemeMode): Promise<void> {
    await this.page.reload({ waitUntil: 'load' });
    const storedAfter = await this.page.evaluate(() =>
      localStorage.getItem('theme'),
    );
    expect(storedAfter, 'localStorage survives reload').toBe(mode);
  }
}
