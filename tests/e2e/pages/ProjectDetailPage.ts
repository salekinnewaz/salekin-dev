/**
 * ProjectDetailPage
 *
 * `/projects/[slug]`: the case study page renders the markdown
 * body (with at least one `<h2>`), the H1 with the project name,
 * and a back / "All projects" link in the page chrome.
 */
import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectDetailPage extends BasePage {
  async goto(slug: string): Promise<void> {
    await this.openAt(`/projects/${slug}`);
  }

  get heading(): Locator {
    return this.page.locator('main h1').first();
  }

  get markdownHeadings(): Locator {
    return this.page.locator('main h2');
  }

  get backLink(): Locator {
    return this.page.getByRole('link', { name: /(back|all projects|projects)/i }).first();
  }

  async expectMarkdownBodyRendered(nameRegex: RegExp): Promise<void> {
    const h1 = this.heading;
    await expect(h1).toContainText(nameRegex);
    const count = await this.markdownHeadings.count();
    expect(count, 'at least one h2 from markdown').toBeGreaterThan(0);
  }

  async expectBackLinkPointsAtIndex(): Promise<void> {
    const link = this.backLink;
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/\/projects/);
  }
}