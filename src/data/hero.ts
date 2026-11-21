/**
 * Hero composition data.
 *
 * The hero's right column is built from four floating capability cards
 * arranged around a circular portrait, plus a QA Pipeline widget that
 * sits below. This file holds the copy for those pieces so the Hero
 * component stays presentational.
 */

/** Icon key for a floating capability card. */
export type HeroCardIcon = 'code' | 'layers' | 'chip' | 'database';

export type HeroCapabilityCard = {
  /** Stable key — React key and icon lookup. */
  id: string;
  /** Card title. */
  title: string;
  /** The tools/technologies listed under the title. */
  detail: string;
  /** Which icon to render. */
  icon: HeroCardIcon;
  /**
   * Where the card sits relative to the portrait, in the reference
   * composition. `top-left` / `bottom-left` / `top-right` /
   * `bottom-right`.
   */
  corner: 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right';
};

/**
 * The four floating capability cards that orbit the hero portrait.
 * Order is the reading order (top-left, top-right, bottom-left,
 * bottom-right) so the DOM order matches the visual order.
 */
export const HERO_CAPABILITY_CARDS: readonly HeroCapabilityCard[] = [
  {
    id: 'frontend-development',
    title: 'Frontend Development',
    detail: 'Angular · TypeScript',
    icon: 'code',
    corner: 'top-left',
  },
  {
    id: 'test-automation',
    title: 'Test Automation',
    detail: 'Playwright · CI/CD',
    icon: 'layers',
    corner: 'top-right',
  },
  {
    id: 'ai-driven-qa',
    title: 'AI-Driven QA',
    detail: 'Copilot · MCP · Claude',
    icon: 'chip',
    corner: 'bottom-left',
  },
  {
    id: 'api-performance',
    title: 'API & Performance',
    detail: 'Postman · JMeter',
    icon: 'database',
    corner: 'bottom-right',
  },
] as const;

/** One stage in the QA Pipeline widget. */
export type PipelineStage = {
  /** Stable key. */
  id: string;
  /** Stage label. */
  label: string;
  /** Small caption under the label. */
  detail: string;
  /** Completion state — drives the check/dot indicator. */
  state: 'done' | 'active' | 'pending';
};

/**
 * The QA Pipeline widget: Build → Test → Quality → Release.
 * The first three stages are complete and the last is in flight, which
 * is what gives the widget its progress feel.
 */
export const HERO_PIPELINE: readonly PipelineStage[] = [
  { id: 'build', label: 'Build', detail: 'CI triggered', state: 'done' },
  { id: 'test', label: 'Test', detail: '248 cases', state: 'done' },
  { id: 'quality', label: 'Quality', detail: 'Gate passed', state: 'done' },
  { id: 'release', label: 'Release', detail: 'Shipping', state: 'active' },
] as const;

/**
 * The Core Stack badges, in the exact order they appear in the
 * reference design. Do not reorder or extend — the ordering is part of
 * the intended visual hierarchy (automation first, then languages,
 * then framework, then CI/CD, then platform).
 */
export const HERO_CORE_STACK: readonly string[] = [
  'Playwright',
  'TypeScript',
  'JavaScript',
  'Angular',
  'GitHub Actions',
  'Docker',
  'AWS',
  'MySQL',
] as const;
