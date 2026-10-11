/**
 * tests/e2e/utils/allure.ts
 *
 * Tiny wrapper around `allure-playwright`'s runtime API so each
 * spec file can label its tests in one line, and so we have a
 * single place to change Allure metadata conventions.
 *
 * Usage inside a `test.describe` block:
 *
 *   import { beforeEach } from './utils/allure';
 *   test.describe('Hero', () => {
 *     test.beforeEach(beforeEach({ epic: 'Public site', feature: 'Home' }));
 *     test('renders H1', async ({ page }) => { … });
 *   });
 *
 * Why this exists: Allure groups by Epic > Feature > Story. We
 * only need Epic + Feature for this portfolio (53 cases, 15
 * specs); Story would over-segment. Each describe block becomes
 * a "feature" group in the report sidebar.
 */
import { epic, feature, story } from 'allure-js-commons';

export type AllureMeta = {
  epic: string;
  feature: string;
  story?: string;
};

/**
 * Returns a Playwright beforeEach hook that tags every test in
 * the surrounding describe with the given Epic / Feature / Story.
 * Re-using the same feature name across several describes groups
 * them under one Feature in the report (good for "Smoke" tests
 * that span multiple routes).
 */
export const beforeEach =
  (meta: AllureMeta) =>
  async (): Promise<void> => {
    await epic(meta.epic);
    await feature(meta.feature);
    if (meta.story) await story(meta.story);
  };
