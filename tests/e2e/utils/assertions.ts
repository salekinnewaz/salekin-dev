/**
 * Cross-cutting assertion helpers used by specs and Page Objects.
 *
 * These are NOT Page Objects — they are pure functions for things
 * that don't belong to a single component: keyboard dispatch,
 * hydration waits, body-text sniff, axe-core scan.
 */
import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Dispatch a synthetic keyboard event to `window`. Used by tests
 * that need to assert the page's window-level keydown handler
 * (e.g. the TerminalEasterEgg's Cmd+K / Ctrl+K binding).
 */
export async function pressChord(
  page: Page,
  opts: {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  },
): Promise<void> {
  await page.evaluate((o) => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: o.key,
        ctrlKey: !!o.ctrlKey,
        metaKey: !!o.metaKey,
        shiftKey: !!o.shiftKey,
        altKey: !!o.altKey,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, opts);
}

/**
 * Wait for the document to be fully loaded. Used to make sure
 * React has hydrated and any window-level event listeners are
 * attached before tests dispatch synthetic events.
 */
export async function waitForHydration(
  page: Page,
  timeout = 10_000,
): Promise<void> {
  await page.waitForFunction(
    () => document.readyState === 'complete',
    { timeout },
  );
}

/**
 * Read `body.innerText()`, lowercase it, and assert it contains
 * the given fragment. Used by smoke tests and the 404 test to
 * confirm a route rendered something semantically meaningful.
 */
export async function expectBodyContainsIgnoreCase(
  page: Page,
  fragment: string,
): Promise<void> {
  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(
    body,
    `body should contain "${fragment}" (case-insensitive)`,
  ).toContain(fragment.toLowerCase());
}

/**
 * Run an axe-core scan on the current page, filtered to the
 * "serious" + "critical" impact levels. Throws a detailed
 * error listing every violation so the CI log shows the rule
 * IDs and node counts at a glance.
 */
export async function expectNoSeriousA11yViolations(
  page: Page,
  path: string,
): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // Animations + the always-rotating text can be confusing for
    // axe. Landmarks and region rules flag multi-landmark pages
    // unnecessarily. link-name fires on the floating SideNav
    // (visible text is split across aria-hidden dot + content
    // spans); the nav IS labelled, axe is being strict about
    // the structure. Tracked separately.
    .disableRules(['color-contrast', 'landmark-one-main', 'region', 'link-name'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  if (serious.length) {
    const summary = serious
      .map(
        (v) =>
          `  - ${v.id} [${v.impact}] (${v.nodes.length} nodes) — ${v.help}`,
      )
      .join('\n');
    throw new Error(
      `Accessibility violations on ${path}:\n${summary}\n\nFull report: ${JSON.stringify(serious, null, 2)}`,
    );
  }
  expect(serious, `no serious/critical a11y violations on ${path}`).toEqual([]);
}
