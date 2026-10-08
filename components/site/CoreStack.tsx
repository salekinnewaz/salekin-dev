/**
 * Core Expertise — 5 categories, each a quiet list. Per brief §8.
 *
 * The list is hardcoded (not pulled from a DB setting) because the
 * QA taxonomy in the brief is shaped differently from the
 * developer-shaped `{languages, frameworks, databases, tools, soft}`
 * JSON the admin panel still uses. The DB JSON is kept for the admin
 * UI to remain functional; the home page renders the curated list
 * here.
 */

type Category = {
  name: string;
  blurb: string;
  items: string[];
};

const CATEGORIES: Category[] = [
  {
    name: 'Test Automation',
    blurb: 'Browser and end-to-end frameworks',
    items: ['Playwright', 'Selenium'],
  },
  {
    name: 'API & Contract Testing',
    blurb: 'REST, contract, schema',
    items: ['Postman', 'Swagger', 'REST'],
  },
  {
    name: 'Performance Testing',
    blurb: 'Load and stress testing',
    items: ['k6', 'JMeter'],
  },
  {
    name: 'Cloud / IoT Testing',
    blurb: 'AWS-backed platforms, IoT',
    items: [
      'AWS DynamoDB',
      'AWS IoT Core',
      'AWS AppSync',
      'AWS SQS',
      'SQL',
    ],
  },
  {
    name: 'QA / Delivery',
    blurb: 'Process and lifecycle',
    items: [
      'Azure DevOps',
      'Jira',
      'TestRail',
      'UAT',
      'CI/CD',
      'Test Strategy',
      'Release Readiness',
    ],
  },
];

export function CoreStack() {
  return (
    <section className="section-anchor relative py-20 sm:py-28">
      <div className="mb-12 flex flex-col gap-3 reveal">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Expertise
        </span>
        <h2 className="heading-display text-4xl sm:text-5xl">
          Core Expertise
        </h2>
      </div>

      <ol
        aria-label="Core expertise by category"
        className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 reveal-stagger"
      >
        {CATEGORIES.map((c, i) => (
          <li
            key={c.name}
            className="flex flex-col gap-4 bg-card p-6 sm:p-8"
          >
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex flex-col gap-1">
                <h3 className="heading-display text-xl text-fg sm:text-2xl">
                  {c.name}
                </h3>
                <p className="text-xs text-muted">{c.blurb}</p>
              </div>
              <span
                aria-hidden="true"
                className="font-mono text-xs uppercase tracking-widest text-muted"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <ul className="flex flex-wrap gap-1.5" role="list">
              {c.items.map((item) => (
                <li key={item} role="listitem">
                  <span className="tag">{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
