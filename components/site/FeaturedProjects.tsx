import Link from 'next/link';
import { getHomepageProjects } from '@/lib/queries/projects';
import { Pill } from './Pill';

type Props = {
  /** Hide the section entirely. Used while admin is still curating. */
  limit?: number;
};

/**
 * Home-page "Featured Work" — the visual centerpiece of the site.
 *
 * One large card on the left, two smaller cards stacked on the right.
 * Plain "Featured Work" heading (no terminal prefix). No index badges,
 * no view-all rail, no `ls --featured` heading.
 *
 * Falls back to the most recent published projects if no `featured`
 * flag is set in admin yet, so the section is never a blank
 * placeholder. If nothing is published at all, the section renders
 * nothing.
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
      tabIndex={-1}
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="mb-12 flex flex-col gap-3 reveal">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Selected work
        </span>
        <h2 className="heading-display text-4xl sm:text-5xl">Featured Work</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 reveal-stagger">
        <FeaturedCard
          project={primary}
          size="lg"
          className="lg:col-span-2"
        />

        {rest.map((p) => (
          <FeaturedCard
            key={p.id}
            project={p}
            className="lg:col-span-1"
          />
        ))}
      </div>
    </section>
  );
}

type FeaturedCardProps = {
  project: import('@/lib/queries/projects').ProjectCard;
  size?: 'lg' | 'sm';
  className?: string;
};

function FeaturedCard({
  project,
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
          isLg ? 'aspect-[16/9]' : 'aspect-[4/3]'
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
                <linearGradient id={`fc-${slug}`} x1="0" y1="0" x2="1" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-accent)"
                    stopOpacity="0.45"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-accent-2)"
                    stopOpacity="0.45"
                  />
                </linearGradient>
              </defs>
              <rect width="320" height="180" fill={`url(#fc-${slug})`} />
            </svg>
          </div>
        )}
      </div>

      <div
        className={`flex flex-col gap-3 ${
          isLg ? 'p-6 sm:p-8' : 'p-5'
        }`}
      >
        <h3
          className={`heading-display text-fg transition-colors group-hover:text-accent ${
            isLg ? 'text-2xl sm:text-3xl' : 'text-lg'
          }`}
        >
          {title}
        </h3>
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
            {techStack.slice(0, isLg ? 4 : 3).map((tag) => (
              <li key={tag}>
                <Pill>{tag}</Pill>
              </li>
            ))}
          </ul>
        ) : null}
        <span className="mt-2 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors group-hover:text-accent">
          <span>view case study</span>
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
