import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getProjectBySlug,
  listPublishedProjects,
} from '@/lib/queries/projects';
import { ProjectCard } from '@/components/site/ProjectCard';
import { ProjectHero } from '@/components/site/ProjectHero';
import { ProjectMarkdown } from '@/components/site/ProjectMarkdown';
import { ProjectToc } from '@/components/site/ProjectToc';
import { env } from '@/lib/env';

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
      type: 'article',
      title: project.title,
      description: project.description,
      ...(project.imageUrl ? { images: [{ url: project.imageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      ...(project.imageUrl ? { images: [project.imageUrl] } : {}),
    },
  };
}

/**
 * Long-form project page.
 *
 *   - ProjectHero (breadcrumb, slug, title, description, tech stack, links)
 *   - Cover image
 *   - Two-column body: ProjectMarkdown + sticky ProjectToc
 *   - More-projects rail of up to 3 siblings
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

  // JSON-LD Article schema for SEO. Only emit when the project has
  // enough information to be meaningful (title + description).
  const siteUrl = env.SITE_URL ?? 'http://localhost:3000';
  const jsonLd: Record<string, unknown> | null = project.description
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: project.title,
        description: project.description,
        ...(project.imageUrl ? { image: project.imageUrl } : {}),
        ...(project.publishedAt
          ? { datePublished: new Date(project.publishedAt).toISOString() }
          : {}),
        ...(project.updatedAt
          ? { dateModified: new Date(project.updatedAt).toISOString() }
          : {}),
        mainEntityOfPage: `${siteUrl}/projects/${project.slug}`,
        ...(project.repoUrl ? { sameAs: project.repoUrl } : {}),
      }
    : null;

  return (
    <article className="flex flex-col gap-12 pt-12 pb-20 sm:pt-16">
      <ProjectHero
        slug={project.slug}
        title={project.title}
        description={project.description}
        techStack={project.techStack}
        publishedAt={project.publishedAt}
        repoUrl={project.repoUrl}
        liveUrl={project.liveUrl}
      />

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
            decoding="async"
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

      {/* Two-column body. Body on the left, sticky TOC on the right
          (only when the body has 2+ h2 headings). */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_14rem]">
        <section
          className="mx-auto w-full max-w-3xl"
          data-testid="project-body"
        >
          <ProjectMarkdown source={project.body} />
        </section>
        <ProjectToc markdown={project.body} />
      </div>

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

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </article>
  );
}
