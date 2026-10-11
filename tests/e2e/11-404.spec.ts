/**
 * 11-404.spec.ts
 *
 * Unknown routes should render the themed not-found page with
 * the site chrome (Header + Footer) still present.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { NotFoundPage } from './pages/NotFoundPage';

test.describe('404', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: '404' }));

  test('unknown route returns 404 and renders the themed not-found', async ({
    page,
  }) => {
    const notFound = new NotFoundPage(page);
    await notFound.goto();
    await notFound.expectRendered();
  });
});