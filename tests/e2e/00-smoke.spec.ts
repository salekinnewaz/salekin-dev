/**
 * 00-smoke.spec.ts
 *
 * Fast canary. Every public route must return 200 and render a
 * `<title>` + `<main>`. This is the first spec to run; if it
 * fails, the rest is irrelevant.
 */
import { test, expect } from '@playwright/test';
import { expectStatusOk, gotoAndReady } from './utils/nav';

const ROUTES = [
  { path: '/', mustContain: 'Salekin' },
  { path: '/about', mustContain: 'At a glance' },
  { path: '/projects', mustContain: 'projects' },
  { path: '/projects/rs-sjoliv', mustContain: 'RS Sjoliv' },
  { path: '/contact', mustContain: 'Salekin' }, // /contact redirects to /#contact
  { path: '/admin/login', mustContain: 'Sign in' },
];

test.describe('Smoke — public routes', () => {
  for (const { path, mustContain } of ROUTES) {
    test(`GET ${path} → 200 + title + main + body content`, async ({
      page,
      request,
    }) => {
      await expectStatusOk(request, path);
      await gotoAndReady(page, path);
      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator('main')).toBeVisible();
      // Body must contain something semantically meaningful so a
      // blank render (e.g. 200 OK with a Next.js error boundary)
      // can't pass. Case-insensitive so casing/headings don't trip.
      const body = (await page.locator('body').innerText()).toLowerCase();
      expect(
        body,
        `${path} body should contain "${mustContain}" (case-insensitive)`,
      ).toContain(mustContain.toLowerCase());
    });
  }
});
