type Recommendation = {
  quote: string;
  name: string;
  role: string;
  company: string;
  /** 2-letter initials shown in a small accent plate when no
   *  LinkedIn photo URL is available. */
  initials: string;
  linkedin: string | null;
};

/**
 * Recommendations — 3 testimonial cards on the v3 #0F0B2A strip.
 *
 * Per the v3 brief:
 *  - Eyebrow: "Trust & Recognition"
 *  - H2: "What People Say" + "Read All Recommendations on LinkedIn"
 *    outline button (top-right; uses `linkedin` from identity)
 *  - 3 dark testimonial cards, NO glow, NO background image
 *  - Each card: large purple quote glyph, the quote, divider, then
 *    avatar (initials plate) + name + role + company + LinkedIn icon
 *
 * Content is hard-coded — this section is not in the DB yet. A
 * follow-up PR can lift the data into a Prisma model + admin CRUD.
 */
const RECOMMENDATIONS: Recommendation[] = [
  {
    quote:
      'Salekin is a dedicated QA engineer with strong automation skills and a great team player. He consistently delivers high-quality work and takes ownership of complex testing challenges.',
    name: 'Rahul Ahmed',
    role: 'Engineering Manager',
    company: 'Brain Station 23',
    initials: 'RA',
    linkedin: 'https://www.linkedin.com/in/rahul-ahmed-example',
  },
  {
    quote:
      'Very proactive, technically strong and always open to learning. Salekin contributed significantly to our project\'s test automation and quality improvement initiatives.',
    name: 'Nusrat Jahan',
    role: 'Product Owner',
    company: 'Brain Station 23',
    initials: 'NJ',
    linkedin: 'https://www.linkedin.com/in/nusrat-jahan-example',
  },
  {
    quote:
      'A detail-oriented QA professional who brings both technical expertise and strong communication skills. It\'s a pleasure working with him.',
    name: 'Tariqul Islam',
    role: 'Senior Software Engineer',
    company: 'Brain Station 23',
    initials: 'TI',
    linkedin: 'https://www.linkedin.com/in/tariqul-islam-example',
  },
];

export function Recommendations({ linkedin }: { linkedin: string | null }) {
  return (
    <section
      id="recommendations"
      tabIndex={-1}
      className="section-anchor relative"
    >
      <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between reveal">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Trust &amp; Recognition
          </span>
          <h2 className="heading-display heading-underline mt-2 text-3xl sm:text-4xl lg:text-5xl">
            What People Say
          </h2>
        </div>
        {linkedin ? (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary self-start sm:self-auto"
          >
            Read All Recommendations on LinkedIn
            <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>

      <p className="mb-8 max-w-2xl text-sm text-fg-2 sm:text-base reveal">
        A few words from people I&apos;ve worked with.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 reveal-stagger">
        {RECOMMENDATIONS.map((r) => (
          <figure
            key={r.name}
            className="card flex flex-col gap-5 p-6 sm:p-7"
          >
            <span
              aria-hidden="true"
              className="select-none font-display text-5xl leading-none text-accent"
            >
              &ldquo;
            </span>
            <blockquote className="text-sm leading-relaxed text-fg-2 text-pretty sm:text-base">
              {r.quote}
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-4">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-semibold text-accent"
                aria-hidden="true"
              >
                {r.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg">
                  {r.name}
                </p>
                <p className="truncate text-xs text-muted">
                  {r.role}
                  <span aria-hidden="true"> · </span>
                  {r.company}
                </p>
              </div>
              {r.linkedin ? (
                <a
                  href={r.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${r.name} on LinkedIn`}
                  className="text-muted transition-colors hover:text-accent"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V10.5H5.67v7.84h2.67zm-1.34-9c.85 0 1.54-.7 1.54-1.55a1.54 1.54 0 1 0-3.08 0c0 .85.69 1.55 1.54 1.55zm11.34 9v-4.59c0-2.19-.45-3.84-3-3.84-1.21 0-2.03.66-2.37 1.3h-.04V10.5h-2.55v7.84h2.66v-3.88c0-1.02.2-2 1.46-2s1.27 1.16 1.27 2.07v3.81h2.57z" />
                  </svg>
                </a>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
