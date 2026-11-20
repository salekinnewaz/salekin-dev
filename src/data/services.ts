/**
 * Consulting services offered by Md Salekin Newaz.
 *
 * Content integrity: every offering below maps to a capability that
 * appears in the verified CV (Playwright E2E automation, AI-driven QA
 * workflows with GitHub Copilot + Azure Boards MCP, API/performance/IoT
 * testing, UAT coordination and release readiness). No invented
 * certifications or client names.
 */

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
