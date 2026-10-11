/**
 * AboutPage
 *
 * `/about`: full name H1, "At a glance" definition list, the
 * Download CV CTA pointing at `/cv-download`, and at least one
 * social link to a recognised network.
 */
import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AboutPage extends BasePage {
  async goto(): Promise<void> {
    await this.openAt('/about');
  }

  get heading(): Locator {
    return this.page.locator('main h1').first();
  }

  get glanceList(): Locator {
    return this.page.locator('dl').first();
  }

  get downloadCvLink(): Locator {
    return this.page.getByRole('link', { name: /download.*cv|resume/i }).first();
  }

  get socialLinks(): Locator {
    return this.page.locator('a[href*="github.com"], a[href*="linkedin.com"]');
  }

  async expectHeadingHasName(): Promise<void> {
    const h1 = this.heading;
    await expect(h1).toBeVisible();
    const text = await h1.innerText();
    expect(text).toMatch(/Salekin/);
    expect(text).toMatch(/Newaz/);
  }

  async expectGlanceListRendered(): Promise<void> {
    const dl = this.glanceList;
    await expect(dl).toBeVisible();
    const dts = dl.locator('dt');
    const dds = dl.locator('dd');
    const dtCount = await dts.count();
    expect(dtCount, 'dl has dt entries').toBeGreaterThan(0);
    expect(await dds.count()).toBeGreaterThanOrEqual(dtCount);
  }

  async expectDownloadCvPointsToEndpoint(): Promise<void> {
    const link = this.downloadCvLink;
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBe('/cv-download');
  }

  async expectHasSocialLinks(): Promise<void> {
    expect(
      await this.socialLinks.count(),
      'at least one social link',
    ).toBeGreaterThan(0);
  }
}
