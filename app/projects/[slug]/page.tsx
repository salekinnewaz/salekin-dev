import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getProjectBySlug,
  listPublishedProjects,
} from '@/lib/queries/projects';
import { ProjectCard } from '@/components/site/ProjectCard';
import { ProjectMarkdown } from '@/components/site/ProjectMarkdown';
import { Pill } from '@/components/site/Pill';
import { SectionDivider } from '@/components/site/SectionDivider';

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return { title: 'Project not found' };
  }
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      ...(project.imageUrl ? { images: [{ url: project.imageUrl }] } : {}),
    },
  };
}

/**
 * Long-form project page.
 *
 *   - Eyebrow + back link
 *   - Hero: title + tagline + tech pills + repo/live CTAs
 *   - Cover (16:9 with deterministic gradient fallback)
 *   - Body rendered by the safe <ProjectMarkdown> renderer
 *   - "More projects" rail of up to 3 siblings
 *
 * `notFound()` (404) when the slug doesn't resolve — so bad URLs don't
 * silently render an empty shell.
 */
export default async function ProjectSlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const all = await listPublishedProjects();
  const more = all.filter((p) => p.slug !== project.slug).slice(0, 3);

  const publishedLabel = project.publishedAt
    ? new Date(project.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      })
    : null;

  return (
    <article className="flex flex-col gap-12 pt-12 pb-20 sm:pt-16">
      {/* Header / breadcrumb */}
      <header className="flex flex-col gap-5 reveal">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted">
          <Link href="/projects" className="hover:text-accent">
            <span aria-hidden="true">← </span>ls ..
          </Link>
          {publishedLabel ? (
            <>
              <span aria-hidden="true">/</span>
              <time dateTime={new Date(project.publishedAt!).toISOString()}>
                {publishedLabel}
              </time>
            </>
          ) : null}
        </div>

        <SectionDivider name={project.slug} trailing="// case study" />

        <h1 className="heading-display heading-gradient text-4xl sm:text-5xl lg:text-6xl">
          {project.title}
        </h1>

        {project.description ? (
          <p className="max-w-3xl text-lg leading-relaxed text-fg-2 sm:text-xl text-pretty">
            {project.description}
          </p>
        ) : null}

        {project.techStack.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {project.techStack.map((tag) => (
              <li key={tag}>
                <Pill>{tag}</Pill>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-3">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary magnetic"
            >
              View live
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline magnetic"
            >
              Source
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
          ) : null}
        </div>
      </header>

      {/* Cover */}
      <div
        className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-mesh"
        data-testid="project-cover"
      >
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <svg
            viewBox="0 0 320 180"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id={`pd-${project.id}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--color-accent-2)" stopOpacity="0.55" />
              </linearGradient>
            </defs>
            <rect width="320" height="180" fill={`url(#pd-${project.id})`} />
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
        )}
      </div>

      {/* Body */}
      <section
        className="mx-auto w-full max-w-3xl"
        data-testid="project-body"
      >
        <ProjectMarkdown source={project.body} />
      </section>

      {/* More projects */}
      {more.length > 0 ? (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="eyebrow">More projects</span>
            <Link
              href="/projects"
              className="font-mono text-xs uppercase tracking-widest text-muted hover:text-accent"
            >
              view all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {more.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
