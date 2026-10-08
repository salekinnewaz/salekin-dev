import Link from 'next/link';
import { getHomepageProjects } from '@/lib/queries/projects';
import { SectionDivider } from './SectionDivider';
import { Pill } from './Pill';

type Props = {
  /** Hide the section entirely. Used while admin is still curating. */
  limit?: number;
};

/**
 * Home-page "Featured Work" — 1 large hero project card plus up to 2
 * smaller cards. Falls back to the most recent published projects if
 * no `featured` flag is set in the admin yet, so the section is never
 * a blank placeholder. If nothing is published at all, the section
 * renders nothing at all.
 */
export async function FeaturedProjects({ limit = 3 }: Props) {
  const projects = await getHomepageProjects(limit);
  if (projects.length === 0) return null;

  const primary = projects[0];
  if (!primary) return null;
  const rest = projects.slice(1);

  return (
    <section
      id="work"
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="flex flex-col gap-4 reveal">
        <SectionDivider name="work" trailing="// case studies" />
        <h2 className="heading-display text-4xl sm:text-5xl">
          <span className="font-mono text-accent-2">$</span>{' '}
          <span className="text-fg">ls</span>{' '}
          <span className="heading-gradient">./projects --featured</span>
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-fg-2 sm:text-lg text-pretty">
          <span className="font-mono text-accent-2">{'> '}</span>
          A small archive of full-stack apps, internal tools, and
          freelance work. Each one is a real project — pick one to see
          the long-form write-up, repo, and live link.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3 reveal-stagger">
        {/* Primary card — full width on its own row, then a 2-up grid. */}
        <FeaturedCard
          project={primary}
          index={1}
          size="lg"
          className="lg:col-span-3"
        />

        {rest.map((p, i) => (
          <FeaturedCard
            key={p.id}
            project={p}
            index={i + 2}
            className="lg:col-span-1"
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between reveal">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {String(projects.length).padStart(2, '0')}
          <span className="text-accent-2"> · </span>
          {projects.length === 1 ? 'entry' : 'entries'}
        </p>
        <Link href="/projects" className="btn-outline magnetic">
          <span aria-hidden="true" className="font-mono text-fg-2/80">$</span>
          view all
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

type FeaturedCardProps = {
  project: import('@/lib/queries/projects').ProjectCard;
  index: number;
  size?: 'lg' | 'sm';
  className?: string;
};

function FeaturedCard({
  project,
  index,
  size = 'sm',
  className = '',
}: FeaturedCardProps) {
  const { slug, title, description, techStack, imageUrl } = project;
  const isLg = size === 'lg';

  return (
    <Link
      href={`/projects/${slug}`}
      className={`group relative block overflow-hidden rounded-2xl border border-border bg-card no-underline transition-colors hover:border-border-strong ${className}`}
    >
      <div
        className={`relative w-full overflow-hidden ${
          isLg ? 'aspect-[21/9]' : 'aspect-[16/9]'
        }`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full bg-mesh" aria-hidden="true">
            <svg
              viewBox="0 0 320 180"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full opacity-90"
            >
              <defs>
                <linearGradient
                  id={`fc-${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-accent)"
                    stopOpacity="0.55"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-accent-2)"
                    stopOpacity="0.55"
                  />
                </linearGradient>
              </defs>
              <rect width="320" height="180" fill={`url(#fc-${index})`} />
              <line
                x1="60"
                y1="140"
                x2="240"
                y2="40"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        <span
          aria-hidden="true"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 font-mono text-[10px] tracking-widest text-white backdrop-blur"
        >
          <span className="text-accent-2">
            [{String(index).padStart(2, '0')}]
          </span>
          {isLg ? 'case study' : 'shipped'}
        </span>
      </div>

      <div
        className={`flex flex-col gap-3 ${
          isLg ? 'p-6 sm:p-8' : 'p-5'
        }`}
      >
        <div className="flex items-baseline justify-between gap-4">
          <h3
            className={`heading-display text-fg transition-colors group-hover:text-accent ${
              isLg ? 'text-3xl sm:text-4xl' : 'text-xl'
            }`}
          >
            {title}
          </h3>
          <span
            aria-hidden="true"
            className="font-mono text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100"
          >
            cat →
          </span>
        </div>
        {description ? (
          <p
            className={`text-fg-2 text-pretty ${
              isLg ? 'text-base sm:text-lg' : 'text-sm'
            }`}
          >
            {description}
          </p>
        ) : null}
        {techStack.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {techStack.slice(0, isLg ? 8 : 4).map((tag) => (
              <li key={tag}>
                <Pill>{tag}</Pill>
              </li>
            ))}
            {techStack.length > (isLg ? 8 : 4) ? (
              <li>
                <Pill>+{techStack.length - (isLg ? 8 : 4)}</Pill>
              </li>
            ) : null}
          </ul>
        ) : null}
        <div className="mt-1 flex items-center justify-between font-mono text-xs text-muted">
          <span>./README.md</span>
          <span
            aria-hidden="true"
            className="text-accent opacity-0 transition-opacity group-hover:opacity-100"
          >
            cat →
          </span>
        </div>
      </div>
    </Link>
  );
}
