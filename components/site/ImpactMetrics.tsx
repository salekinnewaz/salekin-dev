type Metric = {
  /** Big number, e.g. "4+", "60%" */
  value: string;
  /** Two-line label */
  label: string;
  /** Small inline SVG icon (24×24) — kept inline to avoid an icon
   *  library dependency. Each icon uses currentColor so it picks up
   *  the accent purple via the parent span. */
  icon: 'experience' | 'projects' | 'releases' | 'regression';
};

/**
 * ImpactMetrics — 4-card strip on the new #161133 surface.
 *
 * Per the v3 brief, this section is a unified metrics strip directly
 * below the hero. Big purple icon + huge number + short label. No
 * glow, no per-card gradient. Just a clean, scannable row of "what
 * I've shipped".
 */
const METRICS: Metric[] = [
  {
    value: '4+',
    label: 'Years Experience in QA & Automation',
    icon: 'experience',
  },
  {
    value: '4+',
    label: 'International Projects',
    icon: 'projects',
  },
  {
    value: '3',
    label: 'Production Releases',
    icon: 'releases',
  },
  {
    value: '60%',
    label: 'Regression Time Reduction',
    icon: 'regression',
  },
];

function MetricIcon({ id }: { id: Metric['icon'] }) {
  const common = {
    width: 24,
    height: 24,
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
    case 'experience':
      // Person + small clock
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.4" />
          <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
          <path d="M19 6.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'projects':
      // Globe
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16" />
          <path d="M12 4c2.5 2.5 3.7 5.2 3.7 8s-1.2 5.5-3.7 8" />
          <path d="M12 4c-2.5 2.5-3.7 5.2-3.7 8s1.2 5.5 3.7 8" />
        </svg>
      );
    case 'releases':
      // Rocket
      return (
        <svg {...common}>
          <path d="M14.5 4.5c2.5 0 5 2.5 5 5l-7 7-5-5z" />
          <path d="M9.5 13.5l-4 4 1 1 4-4" />
          <circle cx="15" cy="9" r="1.4" fill="currentColor" stroke="none" />
          <path d="M5.5 18.5l-1 2 2-1" />
        </svg>
      );
    case 'regression':
      // Trending-down chart with a small arrow
      return (
        <svg {...common}>
          <path d="M4 17l5-6 4 3 7-8" />
          <path d="M15 6h5v5" />
        </svg>
      );
  }
}

export function ImpactMetrics() {
  return (
    <section
      id="impact"
      tabIndex={-1}
      className="section-anchor relative py-12 sm:py-16"
      aria-label="Impact metrics"
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 reveal-stagger">
        {METRICS.map((m) => (
          <div key={m.label} className="card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-accent">
              <MetricIcon id={m.icon} />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-fg sm:text-4xl">
              {m.value}
            </p>
            <p className="mt-1 text-sm leading-snug text-muted">
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
