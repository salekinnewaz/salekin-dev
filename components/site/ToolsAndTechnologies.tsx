type ToolCategory = {
  title: string;
  tools: string[];
  icon: 'cog' | 'flow' | 'gauge' | 'cloud' | 'rocket';
};

/**
 * ToolsAndTechnologies — replaces CoreStack.
 *
 *  - Eyebrow: "Core Expertise"
 *  - H2: "Tools & Technologies I Work With"
 *  - 5 cards in a responsive grid (1 col mobile, 2 col tablet,
 *    5 col desktop) — each card has an accent icon, title, and
 *    a vertical list of tools.
 *  - Top-right: "View Full Stack →" outline button (links to #skills
 *    for now; the full-stack page is a future add).
 */
const CATEGORIES: ToolCategory[] = [
  {
    title: 'Test Automation',
    tools: ['Playwright', 'Selenium', 'JavaScript'],
    icon: 'cog',
  },
  {
    title: 'API & Contract Testing',
    tools: ['Postman', 'Swagger', 'REST APIs'],
    icon: 'flow',
  },
  {
    title: 'Performance Testing',
    tools: ['k6', 'JMeter'],
    icon: 'gauge',
  },
  {
    title: 'Cloud / IoT Testing',
    tools: [
      'AWS DynamoDB',
      'AWS IoT Core',
      'AWS AppSync',
      'AWS SQS',
      'SQL',
    ],
    icon: 'cloud',
  },
  {
    title: 'QA / Delivery',
    tools: ['Azure DevOps', 'Jira', 'TestRail', 'CI/CD', 'Test Strategy'],
    icon: 'rocket',
  },
];

function CategoryIcon({ id }: { id: ToolCategory['icon'] }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
    focusable: false,
  };
  switch (id) {
    case 'cog':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" />
        </svg>
      );
    case 'flow':
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="12" cy="18" r="2.5" />
          <path d="M6 8.5v3a3 3 0 0 0 3 3" />
          <path d="M18 8.5v3a3 3 0 0 1-3 3" />
        </svg>
      );
    case 'gauge':
      return (
        <svg {...common}>
          <path d="M3 14a9 9 0 0 1 18 0" />
          <path d="M12 14l4-4" />
          <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'cloud':
      return (
        <svg {...common}>
          <path d="M7 18h10a4 4 0 0 0 .9-7.9 5 5 0 0 0-9.6-.6A3.5 3.5 0 0 0 7 18z" />
        </svg>
      );
    case 'rocket':
      return (
        <svg {...common}>
          <path d="M14.5 4.5c2.5 0 5 2.5 5 5l-7 7-5-5z" />
          <path d="M9.5 13.5l-4 4 1 1 4-4" />
          <circle cx="15" cy="9" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

export function ToolsAndTechnologies() {
  return (
    <section
      id="skills"
      tabIndex={-1}
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between reveal">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Core Expertise
          </span>
          <h2 className="heading-display heading-underline mt-2 text-3xl sm:text-4xl lg:text-5xl">
            Tools &amp; Technologies I Work With
          </h2>
        </div>
        <a
          href="#skills"
          className="btn-secondary self-start sm:self-auto"
        >
          View Full Stack
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5 reveal-stagger">
        {CATEGORIES.map((c) => (
          <article key={c.title} className="card flex flex-col gap-3 p-5">
            <div className="text-accent">
              <CategoryIcon id={c.icon} />
            </div>
            <h3 className="text-base font-semibold text-fg">{c.title}</h3>
            <ul className="flex flex-col gap-1.5 text-sm text-fg-2">
              {c.tools.map((t) => (
                <li key={t} className="leading-snug">
                  {t}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
