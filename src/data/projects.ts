/**
 * Featured work: the open-source spotlight (playwright-summary-reporter)
 * plus three enterprise case studies.
 *
 * Content integrity: the case studies are built from the verified CV
 * (RS Sjoliv, the Norway-based maritime/IoT client, and the multi-industry
 * international QA architecture). Metrics are the documented outcomes from
 * the CV — regression cycle reduction "up to 60%", 3 production releases
 * for the Norway client — not invented numbers.
 */

/** A single impact metric shown in the case study modal header. */
export type ImpactMetric = {
  /** The measured value, e.g. "60%". */
  value: string;
  /** What the value describes, e.g. "faster regression cycles". */
  label: string;
};

/** One enterprise case study card. */
export type CaseStudy = {
  /** Stable slug — used as the React key and the modal id. */
  slug: string;
  /** Card + modal title. */
  title: string;
  /** Short subtitle under the title. */
  subtitle: string;
  /** 2–3 line summary shown on the card. */
  summary: string;
  /** Industry / client category badge. */
  category: string;
  /** Impact metrics rendered as a stat row. */
  metrics: readonly ImpactMetric[];
  /** The problem the engagement solved. */
  challenge: string;
  /** Bullet list of the approach taken. */
  approach: readonly string[];
  /** Bullet list of the technical architecture. */
  architecture: readonly string[];
  /** Monospace stack tags. */
  stack: readonly string[];
  /** Optional accent for the card's badge ring. */
  accent?: 'emerald' | 'cyan' | 'indigo';
};

/** The open-source project spotlight. */
export type OssSpotlight = {
  /** The npm package name. */
  name: string;
  /** One-line positioning statement. */
  tagline: string;
  /** Longer description shown in the spotlight body. */
  description: string;
  /** The repo URL. */
  repoUrl: string;
  /** The npm package URL. */
  npmUrl: string;
  /** The exact install command — also the copyable CLI string. */
  installCommand: string;
  /** The local re-run command shown under the GitHub summary table. */
  rerunCommand: string;
  /** Feature badges rendered above the copy bar. */
  badges: readonly string[];
};

/**
 * The zero-dependency open-source project. `playwright-summary-reporter`
 * renders a GITHUB_STEP_SUMMARY table from a Playwright run — no runtime
 * dependencies, so it drops into an existing pipeline without changing
 * the dependency graph.
 */
export const OSS_SPOTLIGHT: OssSpotlight = {
  name: 'playwright-summary-reporter',
  tagline:
    'Turn a Playwright run into a readable GitHub Actions summary — with zero dependencies.',
  description:
    'A Playwright reporter that writes a GITHUB_STEP_SUMMARY table straight from your test run: per-browser pass counts, durations, and failed specs — with no runtime dependencies to audit or upgrade. Drop it into an existing pipeline and the job summary fills itself in.',
  repoUrl: 'https://github.com/salekin-newaz/playwright-summary-reporter',
  npmUrl: 'https://www.npmjs.com/package/playwright-summary-reporter',
  installCommand: 'npm i -D playwright-summary-reporter',
  rerunCommand: 'npx playwright test --reporter=playwright-summary-reporter',
  badges: [
    'Open Source',
    'Zero Dependencies',
    'TypeScript',
    'GitHub Actions',
    'AI Debug Prompts',
  ],
} as const;

/**
 * The three enterprise case studies. `rs-sjoliv` is the rideshare
 * platform; `norway-release-programme` is the 3-release Norway
 * engagement; `multi-industry-qa-architecture` covers the 4+ concurrent
 * international projects.
 */
export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: 'rs-sjoliv',
    title: 'RS Sjoliv — Rideshare Platform',
    subtitle: 'Full-cycle QA for a web + mobile rideshare product',
    category: 'Rideshare',
    summary:
      'End-to-end QA ownership for a rideshare platform delivered as a client engagement — from requirement analysis through production release, across web and mobile.',
    metrics: [
      { value: '100%', label: 'API contract coverage' },
      { value: 'Every sprint', label: 'regression + sanity gate' },
      { value: 'Web + Mobile', label: 'surfaces tested' },
    ],
    challenge:
      'A rideshare product with a mobile app, a web client and a booking API — each with its own regression surface. Requirement ambiguity at kickoff, and no automation, meant every release depended on manual regression cycles.',
    approach: [
      'Analyzed client requirements and translated them into a structured test plan and test data strategy',
      'Designed and executed API tests for the booking flow with Postman and Swagger',
      'Ran load testing with k6 and JMeter to find booking-path bottlenecks under peak demand',
      'Drove regression and sanity suites for every sprint, reporting bugs on Azure DevOps',
      'Wrote the first Selenium automation scripts to remove the highest-churn manual cases',
    ],
    architecture: [
      'Postman collections with environment-scoped variables for staging and production',
      'Swagger-driven contract checks surfaced as Azure DevOps work items',
      'k6 and JMeter load scripts with threshold assertions',
      'Azure DevOps pipelines carrying the regression suite per sprint',
    ],
    stack: ['Postman', 'Swagger', 'k6', 'JMeter', 'Azure DevOps', 'Selenium'],
    accent: 'emerald',
  },
  {
    slug: 'norway-release-programme',
    title: 'Trygg Båt & Norway 3-Release Programme',
    subtitle: 'QA lead for three zero-rollback production releases',
    category: 'Maritime · IoT',
    summary:
      'QA lead for a Norway-based client — 3 production releases delivered with no rollbacks, covering a mobile smart-boat app with IoT telemetry and automatic Man Over Board alerting.',
    metrics: [
      { value: '3', label: 'production releases shipped' },
      { value: '0', label: 'rollbacks' },
      { value: 'UAT', label: 'coordinated + signed off' },
    ],
    challenge:
      'A safety-critical maritime product where a smart-boat app monitors temperature, humidity, water leaks, GPS geofencing, and triggers an automatic Man Over Board engine cut-off and distress alert. The engine cut-off path is a physical-action path — a false negative is not a UI bug, it is a safety event.',
    approach: [
      'Led QA strategy and defined release sign-off criteria with the client before each release',
      'Coordinated UAT with the client team and ran the sign-off sessions',
      'Validated IoT telemetry ingestion end to end, including the MOB alert path',
      'Owned release readiness reviews — every release went out with a documented evidence pack',
      'Ran cross-functional coordination across client, engineering and QA',
    ],
    architecture: [
      'IoT Core telemetry ingestion validated against the alert service',
      'Geofencing and MOB alert paths exercised as explicit release-gate cases',
      'Azure DevOps release pipelines with automated regression gates',
      'Evidence-based sign-off pack assembled per release candidate',
    ],
    stack: ['Playwright', 'Postman', 'k6', 'Azure DevOps', 'IoT Core'],
    accent: 'cyan',
  },
  {
    slug: 'multi-industry-qa-architecture',
    title: 'Multi-Industry International QA Architecture',
    subtitle: 'One QA model across 4+ concurrent international projects',
    category: 'Logistics · Oil & Gas · IoT · E-commerce',
    summary:
      'A single QA architecture applied across 4+ concurrent international client projects in logistics, oil & gas, IoT, e-commerce and rideshare — so each new engagement inherited a proven test strategy instead of starting from zero.',
    metrics: [
      { value: '4+', label: 'concurrent international projects' },
      { value: 'Up to 60%', label: 'faster regression cycles' },
      { value: '3', label: 'countries: Norway, Canada, USA' },
    ],
    challenge:
      'Four-plus concurrent client engagements, each with a different domain, a different stack, and a different definition of "done". Without a shared architecture, every project re-invented its own test strategy, and regression cycles stretched to the point where teams stopped running them.',
    approach: [
      'Defined a reusable QA strategy and test-prioritisation model applied across every engagement',
      'Built and maintained Playwright E2E frameworks with Page Object Models and data-driven layers',
      'Integrated the suites into GitHub Actions CI/CD pipelines across all projects',
      'Introduced AI-driven QA workflows for test case ideation and root cause analysis',
      'Mentored junior QA engineers through code review and hands-on automation training',
    ],
    architecture: [
      'Playwright framework layer: Page Objects + data-driven fixtures + shared auth state',
      'GitHub Actions pipelines with sharding, retries and artifact retention',
      'Postman / Swagger contract tests feeding the same release gate',
      'k6 and JMeter performance gates running alongside functional suites',
      'Copilot-assisted generation and Azure Boards MCP-driven defect reporting',
    ],
    stack: [
      'Playwright',
      'TypeScript',
      'Postman',
      'JMeter',
      'AWS DynamoDB',
      'GitHub Actions',
    ],
    accent: 'indigo',
  },
] as const;

/** Look up a case study by slug. */
export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}

/** The filter buckets offered by the Work section's filter pills. */
export const WORK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open-source', label: 'Open Source' },
  { id: 'enterprise', label: 'Enterprise' },
] as const;

export type WorkFilterId = (typeof WORK_FILTERS)[number]['id'];
