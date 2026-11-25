/**
 * Consulting services offered by Md Salekin Newaz.
 *
 * Content integrity: every offering below maps to a capability that
 * appears in the verified CV (Playwright E2E automation, AI-driven QA
 * workflows with GitHub Copilot + Azure Boards MCP, API/performance/IoT
 * testing, UAT coordination and release readiness). No invented
 * certifications or client names.
 */

/**
 * The accent family a card is themed with. Each value maps to a set of
 * CSS custom properties (--svc-accent, --svc-accent-soft) declared in
 * `globals.css`, so the hue lives in the stylesheet rather than as an
 * inline style on every element.
 */
export type ServiceAccent = 'emerald' | 'cyan' | 'violet' | 'blue' | 'amber' | 'purple';

/** The 4 consulting offerings rendered in the Services bento grid. */
export type Service = {
  /** Stable slug — also used as the React key and the contact pill id. */
  id: string;
  /** Card title. */
  title: string;
  /** Short qualifier shown next to the title. */
  subtitle: string;
  /** Uppercase badge rendered in the card header (MOST REQUESTED, etc). */
  badge: string;
  /** Engagement cadence shown in the pinned footer pill. */
  cadence: string;
  /** 3 concrete deliverables with a checkmark. */
  deliverables: readonly string[];
  /** Long-form description used by the contact form prefill. */
  description: string;
};

/**
 * The pill label shown in the Contact form's service selector. Keyed by
 * `Service.id` so the Services → Contact handoff can map a service card
 * to its exact pill without string matching.
 */
export const SERVICE_PILL_LABELS: Record<string, string> = {
  'playwright-automation': 'Playwright Automation',
  'ai-driven-qa': 'AI-Driven QA',
  'api-load-testing': 'API & Load Testing',
  'release-qa-lead': 'Release Audit / QA Lead',
  general: 'General / Mentoring',
};

/**
 * Canonical contact-pill order. The Contact form renders these in this
 * order; `general` is always last as the catch-all.
 */
export const CONTACT_SERVICE_PILLS: readonly string[] = [
  'playwright-automation',
  'ai-driven-qa',
  'api-load-testing',
  'release-qa-lead',
  'general',
];

/**
 * The 4 consulting offerings. The `id` values match the keys of
 * `SERVICE_PILL_LABELS` so "Request This Service →" can preselect the
 * exact pill in the contact form.
 */
export const SERVICES: readonly Service[] = [
  {
    id: 'playwright-automation',
    title: 'Playwright E2E & CI/CD Automation',
    subtitle: 'Durable end-to-end suites that run on every push',
    badge: 'Most Requested',
    cadence: 'Project / Sprint',
    deliverables: [
      'Page Object Model suite with data-driven test layers',
      'Cross-browser execution (Chromium, WebKit, Firefox, Mobile Safari)',
      'GitHub Actions pipeline with shard + retry strategy',
    ],
    description:
      'A Playwright automation suite built to be maintained: Page Object Models, data-driven layers, and CI integration that cuts regression cycles by up to 60%.',
  },
  {
    id: 'ai-driven-qa',
    title: 'AI-Driven QA Modernization',
    subtitle: 'AI where it removes toil — not where it adds noise',
    badge: 'High Impact',
    cadence: 'Workshop / Implementation',
    deliverables: [
      'AI-assisted test case ideation and root cause analysis',
      'GitHub Copilot-assisted automation script generation',
      'Azure Boards MCP integration for defect and sprint reporting',
    ],
    description:
      'Practical AI adoption across the QA lifecycle: test case ideation, root cause analysis, Copilot-assisted automation, and MCP integration with Azure Boards.',
  },
  {
    id: 'api-load-testing',
    title: 'API, Performance & IoT Reliability',
    subtitle: 'Contract, load and device-level validation',
    badge: 'System Scale',
    cadence: 'Audit / Benchmark',
    deliverables: [
      'API contract and regression testing (Postman, Swagger)',
      'Load and stress benchmarks (k6, JMeter) with pass/fail gates',
      'IoT telemetry validation on AWS IoT Core, AppSync, SQS',
    ],
    description:
      'Layered non-functional testing: API contract coverage, k6/JMeter load benchmarks wired as CI gates, and IoT telemetry validation on AWS-backed device platforms.',
  },
  {
    id: 'release-qa-lead',
    title: 'Release Readiness & Fractional QA Lead',
    subtitle: 'Sign-off criteria your clients can trust',
    badge: 'Advisory',
    cadence: 'Retainer / Launch',
    deliverables: [
      'Test strategy, risk coverage and release sign-off criteria',
      'UAT coordination and client-facing sign-off',
      'Release readiness reviews and launch gate ownership',
    ],
    description:
      'Fractional QA leadership for teams without a senior QA function: strategy, risk coverage, UAT coordination, and a defensible release sign-off process.',
  },
] as const;

/**
 * A capability card in the Services grid.
 *
 * The Services module opens with six capability cards arranged in a
 * 3-column grid. Each card is themed with its own accent family so the
 * grid reads as a spectrum rather than six identical boxes, and each
 * carries an icon tile, a one-line summary and three deliverables.
 */
export type ServiceCapability = {
  /** Stable slug — also used as the React key. */
  id: string;
  /** Card title. */
  title: string;
  /** One-sentence summary under the title. */
  summary: string;
  /** Icon key — maps to a glyph in the `SERVICE_ICONS` table. */
  icon: string;
  /** The accent family the card is themed with. */
  accent: ServiceAccent;
  /** 3 concrete deliverables with a checkmark. */
  deliverables: readonly string[];
  /** Long-form description used by the contact form prefill. */
  description: string;
};

/**
 * The six capability cards. The first four map onto the canonical
 * `SERVICES` entries above (and therefore onto the contact pills); the
 * two delivery-oriented cards map onto the same contact channel via
 * `SERVICE_CAPABILITY_PILL`.
 */
export const SERVICE_CAPABILITIES: readonly ServiceCapability[] = [
  {
    id: 'test-automation',
    title: 'Test Automation & Quality Engineering',
    summary:
      'Design and implement scalable test automation solutions to ensure product quality and accelerate delivery.',
    icon: 'layers',
    accent: 'emerald',
    deliverables: [
      'End-to-end automation (Playwright, Selenium)',
      'CI/CD integration (GitHub Actions, Azure Pipelines)',
      'Test framework design (POM, fixtures, reporting)',
    ],
    description:
      'End-to-end test automation built on Playwright and Selenium, wired into GitHub Actions or Azure Pipelines, with a Page Object Model core, shared fixtures and consolidated reporting.',
  },
  {
    id: 'frontend-development',
    title: 'Frontend Development & QA Support',
    summary:
      'Build and enhance modern, user-centric web applications and ensure their quality through a developer’s QA perspective.',
    icon: 'code',
    accent: 'cyan',
    deliverables: [
      'Frontend development with Angular & TypeScript',
      'Feature implementation, UI development & integration',
      'Quality assurance, code review, and issue resolution',
    ],
    description:
      'Angular and TypeScript feature delivery paired with hands-on QA — component integration, code review and defect resolution from the developer side of the table.',
  },
  {
    id: 'ai-modernization',
    title: 'AI-Augmented QA Modernization',
    summary:
      'Leverage AI to improve test design, automation, defect analysis, and overall QA efficiency.',
    icon: 'chip',
    accent: 'violet',
    deliverables: [
      'AI-assisted test case generation and review',
      'Defect analysis and root cause identification',
      'AI-integrated workflows (e.g., Copilot, Claude, MCP)',
    ],
    description:
      'AI applied where it measurably helps — assisted test case generation and review, root cause analysis, and Copilot/Claude/MCP workflows woven into the existing QA process.',
  },
  {
    id: 'api-performance',
    title: 'API, Performance & Reliability Testing',
    summary:
      'Validate functionality, performance, and stability across APIs and integrated systems.',
    icon: 'database',
    accent: 'blue',
    deliverables: [
      'API testing (Postman, Swagger/OpenAPI)',
      'Load and stress testing (JMeter)',
      'Reliability and scalability validation (web, mobile, IoT)',
    ],
    description:
      'API contract coverage through Postman and Swagger/OpenAPI, load and stress benchmarks with JMeter, and reliability validation across web, mobile and IoT fleets.',
  },
  {
    id: 'release-advisory',
    title: 'Release Readiness & QA Advisory',
    summary:
      'Provide strategic QA planning, risk assessment, and release support for a smooth go-to-market.',
    icon: 'rocket',
    accent: 'amber',
    deliverables: [
      'QA strategy, test planning, and risk coverage',
      'UAT coordination and stakeholder alignment',
      'Release readiness review and quality sign-off',
    ],
    description:
      'Strategic QA planning, risk assessment and release support — from test strategy and UAT coordination through to a defensible release sign-off.',
  },
  {
    id: 'end-to-end-delivery',
    title: 'End-to-End Software Delivery',
    summary:
      'Collaborate across the full SDLC to turn requirements into a high-quality, production-ready product.',
    icon: 'stack',
    accent: 'purple',
    deliverables: [
      'Requirement analysis and solution planning',
      'Development, testing, and quality assurance',
      'CI/CD, deployment, and post-release support',
    ],
    description:
      'Full-lifecycle delivery — requirement analysis through development, testing, CI/CD deployment and post-release support for web, mobile and IoT products.',
  },
] as const;

/**
 * Maps a capability card to the contact-pill it should preselect when
 * its "Learn More" / request action fires. The four canonical service
 * ids map to themselves; the two delivery cards fold into the closest
 * existing pill so the contact form never receives an unknown id.
 */
export const SERVICE_CAPABILITY_PILL: Record<string, string> = {
  'test-automation': 'playwright-automation',
  'frontend-development': 'playwright-automation',
  'ai-modernization': 'ai-driven-qa',
  'api-performance': 'api-load-testing',
  'release-advisory': 'release-qa-lead',
  'end-to-end-delivery': 'release-qa-lead',
};

/**
 * The glyph shown in each capability card's icon tile. Kept as a plain
 * map so the data module stays free of JSX.
 */
export const SERVICE_ICONS: Record<string, string> = {
  layers: 'layers',
  code: 'code',
  chip: 'chip',
  database: 'database',
  rocket: 'rocket',
  stack: 'stack',
};

/**
 * The lifecycle strip under the Services header. Each stage is a pill
 * with an icon and a label, mirroring the SDLC the engagements cover.
 */
export type ServiceStage = {
  /** Stable key. */
  id: string;
  /** Icon name from the `ServiceIcon` set. */
  icon: string;
  /** Stage label. */
  label: string;
};

export const SERVICE_STAGES: readonly ServiceStage[] = [
  { id: 'build', icon: 'code-2', label: 'Build' },
  { id: 'test', icon: 'layers-2', label: 'Test' },
  { id: 'automate', icon: 'bolt', label: 'Automate' },
  { id: 'release', icon: 'box', label: 'Release' },
  { id: 'support', icon: 'headset', label: 'Support' },
] as const;

/** The 3-step engagement model rendered as a divided bar below the grid. */
export type EngagementStep = {
  /** Step index, rendered as a monospace "01". */
  index: string;
  title: string;
  /** Short duration or deliverable descriptor. */
  detail: string;
};

/**
 * The engagement steps shown in the single divided 3-column bar that
 * sits directly below the Services bento grid.
 */
export const ENGAGEMENT_STEPS: readonly EngagementStep[] = [
  {
    index: '01',
    title: 'Discovery & Audit',
    detail: '48h',
  },
  {
    index: '02',
    title: 'Architecture & Execution',
    detail: 'Sprint cadence',
  },
  {
    index: '03',
    title: 'Handoff & CI Ownership',
    detail: 'Your team runs it',
  },
] as const;

/**
 * One step in the "How I Work" process bar. Each step carries its own
 * icon and a short explanatory line.
 */
export type ProcessStep = {
  /** Stable key. */
  id: string;
  /** Step number, rendered as "1." */
  number: string;
  /** Step title. */
  title: string;
  /** One-line explanation. */
  detail: string;
  /** Icon name from the `ServiceIcon` set. */
  icon: string;
};

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    id: 'discover',
    number: '1.',
    title: 'Discover',
    detail: 'Understand goals, requirements, and scope.',
    icon: 'target',
  },
  {
    id: 'plan',
    number: '2.',
    title: 'Plan',
    detail: 'Define solution, test strategy, and delivery approach.',
    icon: 'layers-2',
  },
  {
    id: 'build-test',
    number: '3.',
    title: 'Build & Test',
    detail: 'Develop, test (manual & automated), and iterate.',
    icon: 'code-2',
  },
  {
    id: 'release-support',
    number: '4.',
    title: 'Release & Support',
    detail: 'Deliver, monitor, and provide ongoing support.',
    icon: 'rocket-2',
  },
] as const;

/**
 * One engagement model in the "Ways to Collaborate" row.
 */
export type EngagementModel = {
  /** Stable key. */
  id: string;
  /** Model title. */
  title: string;
  /** One-line explanation. */
  detail: string;
  /** Icon name from the `ServiceIcon` set. */
  icon: string;
};

export const ENGAGEMENT_MODELS: readonly EngagementModel[] = [
  {
    id: 'project-delivery',
    title: 'Project Delivery',
    detail: 'End-to-end development and QA for a specific scope.',
    icon: 'person',
  },
  {
    id: 'team-augmentation',
    title: 'Team Augmentation',
    detail: 'Extend your team with QA and/or frontend development skills.',
    icon: 'users',
  },
  {
    id: 'advisory',
    title: 'Advisory & Consulting',
    detail: 'QA strategy, process improvement, and tooling recommendations.',
    icon: 'board',
  },
  {
    id: 'ongoing-support',
    title: 'Ongoing Support',
    detail: 'Continuous testing, quality assurance, and post-release maintenance.',
    icon: 'headset',
  },
] as const;

/**
 * Look up a service by its id. Returns `undefined` for unknown ids so
 * callers can safely fall back to a generic selection.
 */
export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

/**
 * The human-readable label for a service id, as shown on the Contact
 * form's service selector pills.
 */
export function serviceLabel(id: string): string {
  return SERVICE_PILL_LABELS[id] ?? 'General / Mentoring';
}
