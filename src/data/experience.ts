/**
 * Career history, credentials and technical stack.
 *
 * Every date, title and institution here is taken from the verified CV
 * and the seeded Experience / Education rows. Nothing is invented.
 */

/** One entry in the career timeline accordion. */
export type CareerEntry = {
  /** Stable id — React key and accordion panel id. */
  id: string;
  /** Job title. */
  role: string;
  /** Employer. */
  company: string;
  /** Location. */
  location: string;
  /** Display period, e.g. "Jan 2025 — Present". */
  period: string;
  /** One-line summary under the role. */
  summary: string;
  /** Accomplishment bullets revealed when the accordion is expanded. */
  bullets: readonly string[];
  /** Whether the entry is expanded by default. */
  defaultOpen: boolean;
};

/**
 * The career timeline. Ordered newest first. The senior role is expanded
 * by default; the rest collapse smoothly.
 */
export const CAREER: readonly CareerEntry[] = [
  {
    id: 'brain-station-23-senior',
    role: 'Senior Software QA Engineer',
    company: 'Brain Station 23',
    location: 'Dhaka, Bangladesh',
    period: 'Jan 2025 — Present',
    summary:
      'QA strategy and release sign-off across 4+ concurrent international projects in logistics, oil & gas, IoT, e-commerce and rideshare — with clients in Norway, Canada and the USA.',
    bullets: [
      'Led end-to-end QA strategy across 4+ concurrent international projects — defining test scope, risk coverage and release sign-off criteria',
      'Maintained Playwright E2E frameworks with Page Object Models and data-driven layers, integrated into GitHub Actions — reducing regression cycles by up to 60%',
      'Led QA and delivered 3 production releases for a Norway-based client, coordinating UAT, client sign-off and release readiness',
      'Drove API and performance testing with Postman, Swagger, k6 and JMeter across high-load production environments',
      'Pioneered AI-driven QA workflows — Copilot for automation generation, MCP integration with Azure Boards for defect and sprint reporting',
      'Mentored junior QA engineers through code review, test architecture guidance and hands-on Playwright training',
      'Supported presales by demonstrating testing frameworks and QA process maturity to prospective clients',
    ],
    defaultOpen: true,
  },
  {
    id: 'brain-station-23-sqa',
    role: 'Software QA Engineer',
    company: 'Brain Station 23',
    location: 'Dhaka, Bangladesh',
    period: 'Jan 2024 — Dec 2024',
    summary:
      'Mid-level QA across web, mobile, API and IoT products on multiple concurrent client engagements.',
    bullets: [
      'Developed and executed comprehensive test plans — manual and automated — from project requirements',
      'Coordinated and supported UAT, ensuring products met quality standards before client sign-off',
      'Ran performance testing with k6 and JMeter and continuously improved the testing strategy',
      'Performed API testing with Swagger and Postman, and database testing with SQL and AWS DynamoDB',
      'Tested IoT projects on AWS IoT Core, AppSync and SQS, managing multiple dynamic projects one-to-one',
      'Took ownership of product quality, giving feedback on test coverage, risks and overall product integrity',
    ],
    defaultOpen: false,
  },
  {
    id: 'brain-station-23-associate',
    role: 'Associate Software QA Engineer',
    company: 'Brain Station 23',
    location: 'Dhaka, Bangladesh',
    period: 'May 2022 — Dec 2023',
    summary:
      'Project: RS Sjoliv — a rideshare platform. Full-cycle QA from requirement analysis through production release.',
    bullets: [
      'Tested the RS app and web application across both surfaces',
      'Analyzed client requirements, prepared test data and authored the test plan and test cases',
      'Ran API testing with Postman and Swagger, and load testing with k6 and JMeter',
      'Reported bugs on Azure DevOps and ran regression and sanity testing every sprint',
      'Wrote Selenium automation scripts for the highest-churn manual cases',
      'Participated in backlog grooming, sprint planning, sprint review and retrospectives',
    ],
    defaultOpen: false,
  },
  {
    id: 'brain-station-23-trainee',
    role: 'Trainee Software QA Engineer',
    company: 'Brain Station 23',
    location: 'Dhaka, Bangladesh',
    period: 'Jan 2022 — Apr 2022',
    summary:
      'QA trainee role — automation fundamentals, JMeter load testing and Postman API testing.',
    bullets: [
      'Requirement analysis on client projects',
      'Automation learning and implementation',
      'Load testing with JMeter on TEQ projects',
      'API testing with Postman — practice and implementation',
    ],
    defaultOpen: false,
  },
  {
    id: 'sebpo-trainee',
    role: 'Trainee QA Engineer',
    company: 'SEBPO',
    location: 'Bangladesh',
    period: 'Nov 2021 — Dec 2021',
    summary:
      'Trainee QA — cross-browser and cross-OS consistency testing, test data preparation and planning.',
    bullets: [
      'Analyzed client requirements',
      'Checked consistency across browsers and operating systems',
      'Reported QA-related issues to developers',
      'Tested creative banners and ads',
      'Prepared test data and test plans',
    ],
    defaultOpen: false,
  },
] as const;

/** A credential shown in the Verified Credentials card. */
export type Credential = {
  /** Credential name. */
  label: string;
  /** Issuing body, or the year for a dated credential. */
  detail: string;
  /** True when this credential is the headline (ISTQB® Foundation). */
  featured?: boolean;
};

/**
 * The verified credentials. `istqb` is the headline badge; the rest
 * render as compact pills.
 */
export const CREDENTIALS: readonly Credential[] = [
  {
    label: 'ISTQB® Certified Tester — Foundation Level',
    detail: 'International Software Testing Qualifications Board',
    featured: true,
  },
  {
    label: 'B.Sc. in Computer Science & Engineering',
    detail: 'International Islamic University Chittagong · 2016–2020',
    featured: true,
  },
  {
    label: 'AWS Cloud Foundations',
    detail: 'Amazon Web Services',
  },
  {
    label: 'Cisco IoT',
    detail: 'Cisco Networking Academy',
  },
  {
    label: 'NVIDIA DLI — Deep Learning',
    detail: 'NVIDIA Deep Learning Institute',
  },
  {
    label: 'GitHub Copilot for QA',
    detail: 'GitHub',
  },
] as const;

/** One row in the Core Technical Stack matrix. */
export type StackGroup = {
  /** Row label. */
  label: string;
  /** Monospace technology pills. */
  items: readonly string[];
};

/**
 * The 4 categorised technical stack rows shown in the stack matrix card.
 */
export const STACK_GROUPS: readonly StackGroup[] = [
  {
    label: 'Automation',
    items: ['Playwright', 'TypeScript', 'Selenium', 'Page Object Model'],
  },
  {
    label: 'AI & Workflows',
    items: ['GitHub Copilot', 'Azure Boards MCP', 'Prompt Engineering'],
  },
  {
    label: 'API & Perf',
    items: ['Postman', 'Swagger', 'k6', 'JMeter', 'REST'],
  },
  {
    label: 'Cloud & CI/CD',
    items: [
      'GitHub Actions',
      'Azure DevOps',
      'AWS IoT Core',
      'DynamoDB',
      'Jira',
    ],
  },
] as const;

/**
 * The 4 headline credibility metrics shown in the bar directly beneath
 * the hero. Every number is drawn from the verified CV.
 *
 * `icon` is the key for the glyph that sits to the left of the number.
 *
 * The fourth metric carries extra content that the other three do not:
 * a link to the published package, and a supporting line about open
 * source. `link` and `supporting` are therefore optional — a metric
 * without them renders as a plain number / label / detail triple.
 *
 * `downloads` is kept as its own field rather than being baked into
 * `value` so the npm download count can later be wired to live data
 * without touching the layout.
 */
export const CREDIBILITY_METRICS: readonly {
  value: string;
  label: string;
  detail: string;
  icon: 'briefcase' | 'globe' | 'rocket' | 'package';
  /** Optional link shown under the label — the published package. */
  link?: {
    text: string;
    href: string;
  };
  /** Optional supporting line shown under the link. */
  supporting?: {
    text: string;
    icon: 'github';
  };
}[] = [
  {
    value: '5+',
    label: 'Years in QA & Development',
    detail: 'Jan 2022 — Present, ISTQB® Certified',
    icon: 'briefcase',
  },
  {
    value: '4+',
    label: 'Global Projects',
    detail: 'Norway · Canada · USA',
    icon: 'globe',
  },
  {
    value: '3',
    label: 'Production Releases',
    detail: 'Delivered with confidence',
    icon: 'rocket',
  },
  {
    // The download count is the npm registry's total for the package.
    // It lives in its own field so it can be replaced by a live
    // registry lookup later without changing anything else.
    value: '435+',
    label: 'npm Downloads',
    detail: '',
    icon: 'package',
    link: {
      text: 'playwright-summary-reporter',
      href: 'https://www.npmjs.com/package/playwright-summary-reporter?activeTab=versions',
    },
    supporting: {
      text: 'Open Source Contributor',
      icon: 'github',
    },
  },
] as const;
