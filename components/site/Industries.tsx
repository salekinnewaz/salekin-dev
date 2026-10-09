type Industry = {
  id: string;
  label: string;
  icon: 'truck' | 'oil' | 'iot' | 'cart' | 'car';
};

/**
 * Industries — compact horizontal row of 5 industry tags.
 *
 * Per the v3 brief:
 *  - Eyebrow: "Industries"
 *  - H2: "Domains I've Worked In"
 *  - 5 icon-prefixed tags in a single row (responsive: 2-3 cols on
 *    mobile, 5 cols on desktop)
 *  - No card surface — tags sit on the dark base with a thin border
 */
const INDUSTRIES: Industry[] = [
  { id: 'logistics', label: 'Logistics', icon: 'truck' },
  { id: 'oil-gas', label: 'Oil & Gas', icon: 'oil' },
  { id: 'iot', label: 'IoT', icon: 'iot' },
  { id: 'ecom', label: 'E-commerce', icon: 'cart' },
  { id: 'rideshare', label: 'Rideshare', icon: 'car' },
];

function IndustryIcon({ id }: { id: Industry['icon'] }) {
  const common = {
    width: 18,
    height: 18,
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
    case 'truck':
      return (
        <svg {...common}>
          <path d="M2 7h11v10H2z" />
          <path d="M13 10h5l3 3v4h-8" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
      );
    case 'oil':
      return (
        <svg {...common}>
          <path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 1 1 2 2 2 0-2-1-4 0-7z" />
        </svg>
      );
    case 'iot':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M5 12a7 7 0 0 1 14 0" />
          <path d="M2 12a10 10 0 0 1 20 0" />
          <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'cart':
      return (
        <svg {...common}>
          <path d="M3 4h2l2.4 11.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 8H6" />
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
        </svg>
      );
    case 'car':
      return (
        <svg {...common}>
          <path d="M3 13l2-5a3 3 0 0 1 3-2h8a3 3 0 0 1 3 2l2 5" />
          <rect x="3" y="13" width="18" height="5" rx="2" />
          <circle cx="7.5" cy="18.5" r="1.5" />
          <circle cx="16.5" cy="18.5" r="1.5" />
        </svg>
      );
  }
}

export function Industries() {
  return (
    <section
      id="industries"
      tabIndex={-1}
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="mb-8 flex flex-col gap-3 reveal">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          Industries
        </span>
        <h2 className="heading-display heading-underline text-3xl sm:text-4xl lg:text-5xl">
          Domains I&apos;ve Worked In
        </h2>
      </div>

      <ul
        aria-label="Industries"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5 reveal-stagger"
      >
        {INDUSTRIES.map((i) => (
          <li key={i.id}>
            <span className="tag flex items-center gap-2 px-3 py-2">
              <span className="text-accent" aria-hidden="true">
                <IndustryIcon id={i.icon} />
              </span>
              <span className="text-sm">{i.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
