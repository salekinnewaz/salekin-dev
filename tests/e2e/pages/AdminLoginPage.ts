/**
 * AdminLoginPage
 *
 * `/admin/login`: the password-gated admin login. When
 * ADMIN_PASSWORD is set, `/admin` redirects here. After a
 * successful login, the user lands on `/admin` (the dashboard).
 *
 * `gotoUnauthenticated` mimics the unauthenticated user flow
 * (visit `/admin`, expect to be redirected to `/admin/login`).
 * `signInWithPassword` submits the form and waits for the URL
 * to leave `/admin/login` — the caller can then assert against
 * AdminDashboardPage.
 */
import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ADMIN_PASSWORD } from '../utils/nav';

export class AdminLoginPage extends BasePage {
  async goto(): Promise<void> {
    await this.openAt('/admin/login');
  }

  /**
   * Navigate to `/admin` while unauthenticated. The site either
   * server-redirects to `/admin/login` or renders the login
   * form in place; either way the URL ends in `/admin/login`.
   */
  async gotoUnauthenticated(page: Page): Promise<void> {
    const res = await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    expect(res?.status() ?? 0).toBeLessThan(400);
    await expect(page).toHaveURL(/\/admin\/login/);
  }

  get passwordInput(): Locator {
    return this.page.locator('#admin-password');
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /sign in/i });
  }

  get errorAlert(): Locator {
    return this.page.getByRole('alert');
  }

  // ── Flows ────────────────────────────────────────────────────────

  async expectPasswordInputVisible(): Promise<void> {
    const input = this.passwordInput;
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'password');
  }

  async signInWithPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Convenience: sign in with the test fixture password. */
  async signInWithTestPassword(): Promise<void> {
    await this.signInWithPassword(ADMIN_PASSWORD);
  }

  async expectErrorVisible(): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.page).toHaveURL(/\/admin\/login/);
  }
}
