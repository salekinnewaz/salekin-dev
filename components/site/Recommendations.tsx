import {
  RECOMMENDATIONS,
  LINKEDIN_PROFILE_URL,
  initialsFor,
  type Recommendation,
} from '@/lib/site/recommendations';
import { RecommendationsViewMore } from './RecommendationsViewMore';

/** Number of testimonials featured in the main grid. The rest, if
 *  any, are revealed on demand via the `<RecommendationsViewMore>`
 *  disclosure. The brief asks for three featured cards. */
const FEATURED_COUNT = 3;

type Props = {
  /** Maximum cards to show in the main (always-visible) grid.
   *  Defaults to 3. Cards past this limit are still rendered —
   *  they're just moved into the "View more" disclosure. */
  limit?: number;
};

/**
 * Recommendations — "What People Say" section.
 *
 * Per the brief:
 *   - Eyebrow: "TRUST & RECOGNITION"
 *   - H2: "What People Say"
 *   - Subtitle: "A few words from people I've worked with."
 *   - 3-card responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
 *   - Each card: subtle gradient border, quote glyph, quote, name +
 *     role + company, optional profile link
 *   - Prominent "Read All Recommendations on LinkedIn" CTA → the
 *     owner's LinkedIn profile, opens in a new tab with
 *     rel="noopener noreferrer"
 *   - "View More" disclosure when more than 3 cards are configured —
 *     the extras are mounted but hidden until the visitor expands the
 *     list (so the page is honest about the source: all cards live
 *     in the same data file, none are fabricated).
 *   - Honest empty state: when no real recommendations are added
 *     yet, the card grid is hidden and a clear placeholder asks the
 *     site owner to populate the data file. The LinkedIn CTA always
 *     renders (the brief explicitly asks for it).
 *
 * The data lives in `lib/site/recommendations.ts` as a typed array
 * the owner can edit. The component is server-rendered (no client
 * JS) so it's SEO-friendly and accessible. The "View more" toggle
 * is the one client island in this section (mounted via
 * `<RecommendationsViewMore>`).
 */
export function Recommendations({ limit = FEATURED_COUNT }: Props) {
  // Honour the `limit` prop so callers (e.g. tests) can pin the
  // featured count. The disclosure is driven by *all* entries, not
  // just the `limit`-capped list — that way the section never
  // silently drops testimonials because a caller passed a smaller
  // limit.
  const all = RECOMMENDATIONS;
  const initial = all.slice(0, limit);
  const extra = all.slice(limit);
  const hasContent = all.length > 0;

  return (
    <section
      id="recommendations"
      tabIndex={-1}
      className="section-anchor relative py-20 sm:py-28"
      aria-labelledby="recommendations-heading"
    >
      {/* Section header */}
      <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between reveal">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            <span aria-hidden="true" className="opacity-70">$</span>{' '}
            trust &amp; recognition
          </span>
          <h2
            id="recommendations-heading"
            className="heading-display heading-gradient text-3xl sm:text-4xl lg:text-5xl"
          >
            What People Say
          </h2>
          <p className="max-w-2xl text-sm text-fg-2 sm:text-base text-pretty">
            A few words from people I&apos;ve worked with.
          </p>
        </div>

        <a
          href={LINKEDIN_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline magnetic self-start sm:self-auto"
          aria-label="Read all recommendations on LinkedIn (opens in a new tab)"
        >
          Read All Recommendations on LinkedIn
          <span aria-hidden="true" className="ml-1">↗</span>
        </a>
      </div>

      {/* Card grid OR empty-state placeholder */}
      {hasContent ? (
        <>
          <ul
            role="list"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 reveal-stagger"
          >
            {initial.map((r) => (
              <li key={r.id} className="h-full">
                <RecommendationCard recommendation={r} />
              </li>
            ))}
          </ul>
          {/* The disclosure is a no-op when there are no extra cards,
              so we don't need to gate it on `extra.length` here. */}
          <RecommendationsViewMore initial={initial} extra={extra} />
        </>
      ) : (
        <RecommendationsEmptyState count={RECOMMENDATIONS.length} />
      )}
    </section>
  );
}

function RecommendationCard({ recommendation: r }: { recommendation: Recommendation }) {
  const initials = initialsFor(r.name);
  const hasPhoto = Boolean(r.photoUrl);

  return (
    <figure className="glass-card glass-card-hover relative flex h-full flex-col gap-4 p-6 sm:p-7">
      {/* Subtle gradient border overlay — drawn as a 1px ring on top
          of the card using a gradient bg masked to the border. Falls
          back to the existing glass-card border on browsers that
          don't support mask-composite. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-60"
        style={{
          padding: '1px',
          background:
            'linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 55%, transparent), color-mix(in oklab, var(--color-accent-2) 35%, transparent))',
          WebkitMask:
            'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Quote glyph + profile row */}
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className="select-none font-display text-5xl leading-none text-accent"
        >
          &ldquo;
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-widest text-muted"
          aria-label={r.date ? `Recommendation from ${r.date}` : undefined}
        >
          {r.date ?? 'LinkedIn'}
        </span>
      </div>

      <blockquote className="flex-1 text-sm leading-relaxed text-fg-2 text-pretty sm:text-base">
        {r.quote}
      </blockquote>

      <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-4">
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.photoUrl!}
            alt={`${r.name} — ${r.role}, ${r.company}`}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
            loading="lazy"
            decoding="async"
            width={40}
            height={40}
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-semibold text-accent ring-1 ring-inset ring-accent/30"
          >
            {initials}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{r.name}</p>
          <p className="truncate text-xs text-muted">
            {r.role}
            <span aria-hidden="true"> · </span>
            {r.company}
          </p>
        </div>

        {r.linkedinUrl ? (
          <a
            href={r.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${r.name} on LinkedIn (opens in a new tab)`}
            className="text-muted transition-colors hover:text-accent"
          >
            <svg
              width="18"
              height="18"
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
  );
}

/**
 * Honest empty state — renders when no real recommendations are
 * configured. We intentionally do NOT fabricate placeholder
 * testimonials. The CTA to the LinkedIn profile still renders
 * above, so the section never feels empty to a visitor — it just
 * tells the truth that the on-site cards are pending population.
 */
function RecommendationsEmptyState({ count }: { count: number }) {
  return (
    <div
      data-testid="recommendations-empty"
      className="glass-card flex flex-col items-start gap-3 p-6 sm:p-8"
    >
      <span
        aria-hidden="true"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 font-mono text-sm text-accent"
      >
        ✶
      </span>
      <p className="heading-display text-xl text-fg sm:text-2xl">
        Real recommendations are on the way
      </p>
      <p className="max-w-prose text-sm leading-relaxed text-fg-2 text-pretty">
        Verified recommendations from colleagues and managers will
        appear here. In the meantime, every published recommendation
        is on the owner&apos;s LinkedIn profile — use the button
        above to read them in full.
      </p>
      <p
        className="font-mono text-[10px] uppercase tracking-widest text-muted"
        aria-live="polite"
      >
        on-site cards configured: {count} (pending population)
      </p>
    </div>
  );
}
