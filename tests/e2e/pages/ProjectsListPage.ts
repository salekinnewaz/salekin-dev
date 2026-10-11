/**
 * ProjectsListPage
 *
 * The projects index at `/projects` (and the featured-projects
 * grid on the home page — same card markup, scoped to the home
 * via the optional `home` flag).
 *
 * `goto(slug?)` accepts an optional slug, which navigates to a
 * specific card. With no slug it lands on the index.
 */
import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectsListPage extends BasePage {
  async goto(): Promise<void> {
    await this.openAt('/projects');
  }

  get cards(): Locator {
    return this.page.locator('a[href^="/projects/"]');
  }

  card(slug: string): Locator {
    return this.page.locator(`a[href="/projects/${slug}"]`);
  }

  async expectAllSeededProjectsRender(minCount = 3): Promise<void> {
    const count = await this.cards.count();
    expect(count, `at least ${minCount} seeded projects`).toBeGreaterThanOrEqual(minCount);
  }

  async expectEachCardHasTags(): Promise<void> {
    const count = await this.cards.count();
    for (let i = 0; i < count; i++) {
      const card = this.cards.nth(i);
      const tags = card.locator('.tag');
      expect(await tags.count(), `card ${i} stack tags`).toBeGreaterThan(0);
    }
  }

  async expectSlugLinkVisible(slug: string): Promise<void> {
    await expect(this.card(slug)).toBeVisible();
  }
}
