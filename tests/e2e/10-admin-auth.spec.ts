/**
 * 10-admin-auth.spec.ts
 *
 * The /admin area is password-gated when ADMIN_PASSWORD is set
 * (the webServer env in playwright.config.ts sets it to
 * 'test-admin-pass-1234'). This spec covers:
 *   - GET /admin unauthenticated redirects to /admin/login.
 *   - /admin/login shows the password form.
 *   - Wrong password shows an error.
 *   - Right password (the fixture) authenticates and lands on
 *     the admin dashboard.
 *   - The sign-out action returns to /admin/login.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

test.describe('Admin auth', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Admin', feature: 'Auth' }));

  test('GET /admin while unauthenticated redirects to /admin/login', async ({
    page,
  }) => {
    const login = new AdminLoginPage(page);
    await login.gotoUnauthenticated(page);
  });

  test('login form is rendered with a password input', async ({ page }) => {
    const login = new AdminLoginPage(page);
    await login.goto();
    await login.expectPasswordInputVisible();
  });

  test('wrong password shows an error and stays on login', async ({
    page,
  }) => {
    const login = new AdminLoginPage(page);
    await login.goto();
    await login.signInWithPassword('not-the-right-password');
    await login.expectErrorVisible();
  });

  test('correct password authenticates and lands on /admin', async ({
    page,
  }) => {
    const login = new AdminLoginPage(page);
    const dashboard = new AdminDashboardPage(page);
    await login.goto();
    await login.signInWithTestPassword();
    await dashboard.waitForArrival();
    await dashboard.expectRendered();
  });
});