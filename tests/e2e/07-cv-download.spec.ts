/**
 * 07-cv-download.spec.ts
 *
 * /cv-download is a route handler that logs a download row then
 * redirects (307) to the actual PDF. It also enforces a per-IP
 * rate limit (30/hour) which is high enough that the smoke call
 * never trips it.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';

test.describe('CV download', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'CV download' }));

  test('responds with 2xx or 3xx (logs + redirects to the PDF)', async ({
    request,
  }) => {
    const res = await request.get('/cv-download', {
      maxRedirects: 0,
    });
    // Either a successful 200 (PDF inlined) or a redirect 3xx.
    const code = res.status();
    expect([200, 301, 302, 303, 307, 308]).toContain(code);
    if (code >= 300 && code < 400) {
      const location = res.headers()['location'];
      expect(location, 'redirect Location header').toBeTruthy();
    }
  });

  test('following redirects ends at a PDF (or the same-origin fallback)', async ({
    request,
  }) => {
    const res = await request.get('/cv-download', {
      maxRedirects: 5,
    });
    expect(res.status()).toBeLessThan(400);
    const finalUrl = res.url();
    expect(finalUrl).toMatch(/\.pdf|\/$/);
  });
});
