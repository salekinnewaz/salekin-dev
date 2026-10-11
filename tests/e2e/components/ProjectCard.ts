/**
 * ProjectCard
 *
 * A `ProjectCard` is rendered both on `/projects` (the index)
 * and on the home `#work` section (Featured projects). The
 * markup is the same; both render an `<a href="/projects/...">`
 * with `.tag` chips for the stack.
 *
 * Implemented as named-export functions rather than a class
 * because cards are nested inside a list and the spec usually
 * iterates over them — wrapping each card in an instance would
 * add boilerplate without a payoff.
 */
import { expect, type Locator, type Page } from '@playwright/test';

export function projectCards(page: Page): Locator {
  return page.locator('a[href^="/projects/"]');
}

export function projectCardBySlug(page: Page, slug: string): Locator {
  return page.locator(`a[href="/projects/${slug}"]`);
}

/** Assert the given card has at least one `.tag` stack chip. */
export async function expectCardHasAtLeastOneTag(
  card: Locator,
): Promise<void> {
  const tagCount = await card.locator('.tag').count();
  expect(tagCount, 'card has at least one stack tag').toBeGreaterThan(0);
}
