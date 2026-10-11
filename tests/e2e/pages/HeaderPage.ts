/**
 * HeaderPage
 *
 * The site Header — present on every public route. Contains:
 *   - The desktop pill nav (`nav.pill-nav[aria-label="Section navigation"]`).
 *   - The site brand (`<header>` → `role=banner`).
 *
 * The Header does NOT include the theme toggle or the mobile
 * hamburger here — those live in their own Page Objects /
 * components so a spec that only cares about navigation doesn't
 * have to construct the whole chrome.
 *
 * Why two navs share the same aria-label: the site has both the
 * Header's pill nav AND a floating SideNav. We scope by class
 * (`.pill-nav`) to disambiguate.
 */
import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type HeaderSection = 'work' | 'experience' | 'stack' | 'contact';

export class HeaderPage extends BasePage {
  get brand(): Locator {
    return this.page.getByRole('banner');
  }

  /** The desktop pill nav. Scope by class to avoid the SideNav. */
  get pillNav(): Locator {
    return this.page.locator('nav.pill-nav[aria-label="Section navigation"]');
  }

  /**
   * Find a link in the pill nav by its visible label.
   * `HeaderSection` is the type-safe subset the suite uses.
   */
  sectionLink(label: HeaderSection): Locator {
    return this.pillNav.getByRole('link', {
      name: new RegExp(`^${label}$`, 'i'),
    });
  }

  async goto(): Promise<void> {
    await this.openAt('/');
  }

  // ── Flows ────────────────────────────────────────────────────────

  async expectPillNavVisibleWithLinks(): Promise<void> {
    const nav = this.pillNav;
    await expect(nav).toBeVisible();
    // The 'hero' entry is intentionally filtered out — see
    // HeaderNav.tsx. The labels are "Work", "Experience",
    // "Stack" (for #skills), "Contact", and possibly more.
    for (const label of ['work', 'experience', 'stack', 'contact'] as const) {
      await expect(this.sectionLink(label)).toBeVisible();
    }
  }

  /**
   * Click a pill-nav link and confirm the URL hash updates to the
   * matching anchor. The mapping is explicit so future header
   * changes (e.g. renaming "stack" → "skills") break the test
   * rather than silently mis-mapping.
   */
  async clickSectionLinkAndAssertHash(label: HeaderSection, expectedHash: string): Promise<void> {
    await this.sectionLink(label).click();
    expect(new URL(this.page.url()).hash).toBe(expectedHash);
  }
}
