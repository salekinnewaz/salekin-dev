/**
 * Hero composition data.
 *
 * The hero's right column is built from a large portrait standing on a
 * tilted emerald frame, a vertical stack of four capability cards to the
 * portrait's left, and a QA Pipeline card floating over the portrait's
 * lower-right. This file holds the copy for those pieces so the Hero
 * component stays presentational.
 */

/** Icon key for a capability card. */
export type HeroCardIcon =
  | 'playwright'
  | 'layers'
  | 'sparkles'
  | 'git-branch';

export type HeroCapabilityCard = {
  /** Stable key — React key and icon lookup. */
  id: string;
  /** Card title. */
  title: string;
  /** The tools/technologies listed under the title. */
  detail: string;
  /** Which icon to render. */
  icon: HeroCardIcon;
};

/**
 * The four capability cards, stacked vertically to the left of the
 * portrait. The order is the reading order top-to-bottom.
 */
export const HERO_CAPABILITY_CARDS: readonly HeroCapabilityCard[] = [
  {
    id: 'frontend-development',
    title: 'Frontend Development',
    detail: 'Angular · TypeScript',
    icon: 'playwright',
  },
  {
    id: 'test-automation',
    title: 'Test Automation',
    detail: 'Playwright · CI/CD',
    icon: 'layers',
  },
  {
    id: 'ai-driven-qa',
    title: 'AI-Driven QA',
    detail: 'Copilot · MCP · Claude',
    icon: 'sparkles',
  },
  {
    id: 'api-performance',
    title: 'API & Performance',
    detail: 'Postman · JMeter',
    icon: 'git-branch',
  },
] as const;

/** One stage in the QA Pipeline widget. */
export type PipelineStage = {
  /** Stable key. */
  id: string;
  /** Stage label. */
  label: string;
  /** Completion state — drives the check/dot indicator. */
  state: 'done' | 'active' | 'pending';
};

/**
 * The QA Pipeline widget: Build → Test → Quality → Release.
 * All four stages are complete, which is what gives the widget its
 * "Passed" status in the header.
 */
export const HERO_PIPELINE: readonly PipelineStage[] = [
  { id: 'build', label: 'Build', state: 'done' },
  { id: 'test', label: 'Test', state: 'done' },
  { id: 'quality', label: 'Quality', state: 'done' },
  { id: 'release', label: 'Release', state: 'done' },
] as const;

/** Icon key for a Core Stack technology badge. */
export type StackIcon =
  | 'playwright'
  | 'typescript'
  | 'javascript'
  | 'angular'
  | 'github-actions'
  | 'docker'
  | 'aws'
  | 'mysql';

export type StackTechnology = {
  /** The label shown in the badge. */
  name: string;
  /** Which glyph to render. */
  icon: StackIcon;
};

/**
 * The Core Stack badges, in the exact order they appear in the
 * reference design. Do not reorder or extend — the ordering is part of
 * the intended visual hierarchy (automation first, then languages,
 * then framework, then CI/CD, then platform).
 */
export const HERO_CORE_STACK: readonly StackTechnology[] = [
  { name: 'Playwright', icon: 'playwright' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'JavaScript', icon: 'javascript' },
  { name: 'Angular', icon: 'angular' },
  { name: 'GitHub Actions', icon: 'github-actions' },
  { name: 'Docker', icon: 'docker' },
  { name: 'AWS', icon: 'aws' },
  { name: 'MySQL', icon: 'mysql' },
] as const;
