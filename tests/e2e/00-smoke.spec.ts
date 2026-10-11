/**
 * 00-smoke.spec.ts
 *
 * Fast canary. Every public route must return 200 and render a
 * `<title>` + `<main>`. This is the first spec to run; if it
 * fails, the rest is irrelevant.
 */
import { test, expect } from '@playwright/test';
import { expectStatusOk } from './utils/nav';
import { gotoAndReady } from './utils/nav';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { expectBodyContainsIgnoreCase } from './utils/assertions';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AdminLoginPage } from './pages/AdminLoginPage';

const ROUTES = [
  { path: '/', mustContain: 'Salekin' },
  { path: '/about', mustContain: 'At a glance' },
  { path: '/projects', mustContain: 'projects' },
  { path: '/projects/rs-sjoliv', mustContain: 'RS Sjoliv' },
  { path: '/contact', mustContain: 'Salekin' }, // /contact redirects to /#contact
  { path: '/admin/login', mustContain: 'Sign in' },
] as const;

test.describe('Smoke — public routes', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Smoke' }));

  for (const { path, mustContain } of ROUTES) {
    test(`GET ${path} → 200 + title + main + body content`, async ({
      page,
      request,
    }) => {
      await expectStatusOk(request, path);
      // Boot via Page Objects where one exists, otherwise the
      // generic `gotoAndReady` helper.
      switch (path) {
        case '/':
          await new HomePage(page).goto();
          break;
        case '/about':
          await new AboutPage(page).goto();
          break;
        case '/projects':
          await new ProjectsListPage(page).goto();
          break;
        case '/projects/rs-sjoliv':
          await new ProjectDetailPage(page).goto('rs-sjoliv');
          break;
        case '/admin/login':
          await new AdminLoginPage(page).goto();
          break;
        default:
          await gotoAndReady(page, path);
      }
      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator('main')).toBeVisible();
      await expectBodyContainsIgnoreCase(page, mustContain);
    });
  }
});