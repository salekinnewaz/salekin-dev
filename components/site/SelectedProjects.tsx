import Link from 'next/link';
import { getHomepageProjects } from '@/lib/queries/projects';
import { Pill } from './Pill';

type Props = {
  /** Hide the section entirely. Used while admin is still curating. */
  limit?: number;
};

/**
 * SelectedProjects — renamed from FeaturedProjects for the v3 brief.
 *
 *  - Eyebrow: "Featured Work"
 *  - H2: "Selected Projects" + a "View All Projects →" outline button
 *  - 3 equal cards in a single row on desktop
 *  - Each card: 16:9 cover, project type row ("Web · Mobile · API ·
 *    IoT" — derived from the project's techStack), blurb, tech tags,
 *    "View Project →" outline button
 *  - Sits on the v3 #0D1220 section strip (applied via parent class)
 *
 * The 3 cards are equal-width on desktop (no more "primary + 2
 * secondary" emphasis). All three get the same hover lift.
 */
export async function SelectedProjects({ limit = 3 }: Props) {
  const projects = await getHomepageProjects(limit);
  if (projects.length === 0) return null;

  return (
    <section className="relative">
      <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between reveal">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Featured Work
          </span>
          <h2 className="heading-display heading-underline mt-2 text-3xl sm:text-4xl lg:text-5xl">
            Selected Projects
          </h2>
        </div>
        <Link
          href="/projects"
          className="btn-secondary self-start sm:self-auto"
        >
          View All Projects
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <p className="mb-8 max-w-2xl text-sm text-fg-2 sm:text-base reveal">
        Real projects and practical experience in test automation, API
        testing and quality engineering.
      </p>

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 reveal-stagger">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
}: {
  project: import('@/lib/queries/projects').ProjectCard;
}) {
  const { slug, title, description, techStack, imageUrl } = project;
  const placeholderSrc = `/featured/${slug}.svg`;

  return (
    <Link
      href={`/projects/${slug}`}
      className="card group flex h-full flex-col overflow-hidden p-0 no-underline"
    >
      <div className="relative w-full overflow-hidden aspect-[16/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl ?? placeholderSrc}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-mono text-base font-semibold text-fg transition-colors group-hover:text-accent">
          {title}
        </h3>
        {techStack.length > 0 ? (
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {techStack.slice(0, 4).join(' · ')}
          </p>
        ) : null}
        {description ? (
          <p className="text-sm leading-relaxed text-fg-2 text-pretty">
            {description}
          </p>
        ) : null}
        {techStack.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {techStack.slice(0, 4).map((tag) => (
              <li key={tag}>
                <Pill>{tag}</Pill>
              </li>
            ))}
          </ul>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-2 border-t border-border pt-3 font-mono text-xs uppercase tracking-widest text-muted transition-colors group-hover:text-accent">
          <span>View Project</span>
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
