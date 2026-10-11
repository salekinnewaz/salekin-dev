/**
 * HomePage
 *
 * The home route `/`. Includes the hero (H1, FOCUS chip row,
 * orbit, terminal, ISTQB chip + availability badge), the in-page
 * section anchors the HashScrollController relies on, and the
 * featured projects grid inside <Suspense>.
 *
 * `goto(hash?)` accepts an optional hash so a spec can boot
 * directly to a section without a separate `page.goto` call.
 */
import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  async goto(hash?: string): Promise<void> {
    const url = hash ? `/${hash}` : '/';
    await this.openAt(url);
  }

  // ── Hero ──────────────────────────────────────────────────────────

  get heroHeading(): Locator {
    return this.page.locator('h1').first();
  }

  /**
   * Four hero orbit cards: Playwright (tl), AI-Driven QA (tr),
   * API Testing (bl), CI/CD (br). The same data drives the
   * left FOCUS chip row.
   */
  get orbitCards(): Locator {
    return this.page.locator('.hero-orbit__card');
  }

  get heroTerminalTitle(): Locator {
    // The macOS chrome title is `~/salekin — zsh` per the brief.
    return this.page.getByText(/salekin.*zsh|~\/salekin/i).first();
  }

  get heroTerminalStatus(): Locator {
    // `● Always Learning` is the HeroTerminal's static status line.
    return this.page.getByText(/Always Learning/i);
  }

  // ── Availability badge ────────────────────────────────────────────

  get availabilityBadge(): Locator {
    return this.page.getByRole('status', {
      name: /open to interesting work/i,
    });
  }

  // ── In-page section anchors ──────────────────────────────────────

  sectionAnchor(id: 'hero' | 'work' | 'experience' | 'skills' | 'contact'): Locator {
    return this.page.locator(`#${id}`);
  }

  // ── Featured projects grid (inside <Suspense>) ───────────────────

  get featuredHeading(): Locator {
    return this.page.getByRole('heading', { name: /featured work/i });
  }

  get featuredCards(): Locator {
    return this.page.locator('a[href^="/projects/"]');
  }

  // ── Flows ────────────────────────────────────────────────────────

  async expectHeroHeadingHasName(): Promise<void> {
    const h1 = this.heroHeading;
    await expect(h1).toBeVisible();
    const text = await h1.innerText();
    // The hero renders "Salekin" (white) + "Newaz" (gradient).
    expect(text).toMatch(/Salekin/);
    expect(text).toMatch(/Newaz/);
  }

  async expectFourOrbitCards(): Promise<void> {
    const cards = this.orbitCards;
    await expect(cards).toHaveCount(4);
    await expect(cards.nth(0)).toHaveText(/Playwright/);
    await expect(cards.nth(1)).toHaveText(/AI-Driven QA/);
    await expect(cards.nth(2)).toHaveText(/API Testing/);
    await expect(cards.nth(3)).toHaveText(/CI\/CD/);
  }

  async expectHeroTerminalRenders(): Promise<void> {
    await expect(this.heroTerminalTitle).toBeVisible();
    await expect(this.heroTerminalStatus).toBeVisible();
  }

  async expectAvailabilityBadge(): Promise<void> {
    const badge = this.availabilityBadge;
    await expect(badge).toBeVisible();
    // The "Open to" label is always rendered (independent of the
    // chars' animation phase).
    await expect(badge.getByText(/Open to/i)).toBeVisible();
    // 16 animated char spans + 1 caret span are always in the DOM
    // (their opacity cycles).
    await expect(badge.locator('.availability-badge__char')).toHaveCount(16);
    await expect(badge.locator('.availability-badge__caret')).toHaveCount(1);
  }

  async expectSectionAnchored(id: 'hero' | 'work' | 'experience' | 'skills' | 'contact'): Promise<void> {
    await this.goto(`#${id}`);
    const el = this.sectionAnchor(id);
    await expect(el).toBeAttached();
    // We can't read window.scrollY in a strict assertion (it's
    // racy on short pages), so we just confirm the element exists
    // in the DOM and the URL hash was honored.
    expect(new URL(this.page.url()).hash).toBe(`#${id}`);
  }

  async expectFeaturedProjectsRender(): Promise<void> {
    await this.goto('#work');
    await expect(this.featuredHeading).toBeVisible();
    const cards = this.featuredCards;
    const count = await cards.count();
    expect(count, 'at least one project card').toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const tags = card.locator('.tag');
      expect(await tags.count(), `card ${i} has tags`).toBeGreaterThan(0);
    }
  }
}
