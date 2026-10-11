/**
 * 12-a11y.spec.ts
 *
 * Runs an @axe-core rule scan on the main public pages. Any
 * "serious" or "critical" violation fails the test. Colour-
 * contrast and ARIA misuse are the usual offenders — both worth
 * catching.
 *
 * We don't fail on the noisy "review" / "minor" tags so a
 * single minor issue doesn't block the suite.
 *
 * The scan wrapper lives in `utils/assertions.ts` as
 * `expectNoSeriousA11yViolations` so this spec reads as the
 * page list, not the AxeBuilder API surface.
 */
import { test, expect } from '@playwright/test';
import { gotoAndReady } from './utils/nav';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { expectNoSeriousA11yViolations } from './utils/assertions';

const PAGES = ['/', '/about', '/projects'] as const;

test.describe('Accessibility — axe scan', () => {
  test.beforeEach(
    allureBeforeEach({ epic: 'Accessibility', feature: 'axe-core' }),
  );

  for (const path of PAGES) {
    test(`axe scan: ${path} has no serious/critical violations`, async ({
      page,
    }) => {
      await gotoAndReady(page, path);
      await expectNoSeriousA11yViolations(page, path);
    });
  }
});