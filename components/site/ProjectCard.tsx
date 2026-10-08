import Link from 'next/link';
import type { ProjectCard as ProjectCardType } from '@/lib/queries/projects';
import { Pill } from './Pill';

type ProjectCardProps = {
  project: ProjectCardType;
  /**
   * Index in the list (1-based). When provided, renders the small
   * `01` style index in the top-right of the cover. Omit on the home
   * page where projects don't have a meaningful order.
   */
  index?: number;
};

/**
 * Project tile with:
 *   - 16:9 gradient cover (uses coverUrl if present, otherwise a
 *     deterministic gradient seeded from the slug).
 *   - Title + one-line description + tech pills.
 *   - Subtle lift + accent glow on hover.
 *   - Optional index badge for `/projects` list pages.
 */
export function ProjectCard({ project, index }: ProjectCardProps) {
  const { slug, title, description, techStack, imageUrl } = project;
  return (
    <Link
      href={`/projects/${slug}`}
      className="terminal-card group block overflow-hidden p-0 no-underline"
    >
      <ProjectCover project={project} imageUrl={imageUrl} index={index} />
      <div className="flex flex-col gap-3 p-5">
        <h3 className="font-mono text-base font-semibold text-fg transition-colors group-hover:text-accent">
          {title}
        </h3>
        {description ? (
          <p className="text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
        {techStack.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {techStack.slice(0, 4).map((tag) => (
              <li key={tag}>
                <Pill>{tag}</Pill>
              </li>
            ))}
            {techStack.length > 4 ? (
              <li>
                <Pill>+{techStack.length - 4}</Pill>
              </li>
            ) : null}
          </ul>
        ) : null}
        <div className="mt-1 flex items-center justify-between font-mono text-xs">
          <span className="text-muted">./README.md</span>
          <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100">
            cat →
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProjectCover({
  imageUrl,
  index,
}: {
  project: ProjectCardType;
  imageUrl: string | null;
  index?: number;
}) {
  if (imageUrl) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border">
        {/* Next/Image would be ideal, but to keep this component
           dependency-free we render a plain <img>. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {typeof index === 'number' ? (
          <span className="absolute right-3 top-3 font-mono text-[10px] tracking-widest text-white/90 mix-blend-difference">
            {String(index).padStart(2, '0')}
          </span>
        ) : null}
      </div>
    );
  }
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-mesh">
      {/* Default cover: deterministic gradient + diagonal slash,
         echoing the brand mark. */}
      <svg
        viewBox="0 0 320 180"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`pc-${index ?? 0}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--color-accent-2)" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <rect width="320" height="180" fill={`url(#pc-${index ?? 0})`} />
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
      {typeof index === 'number' ? (
        <span className="absolute right-3 top-3 font-mono text-[10px] tracking-widest text-white/90">
          {String(index).padStart(2, '0')}
        </span>
      ) : null}
    </div>
  );
}