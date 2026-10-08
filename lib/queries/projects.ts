import { db } from '../db';
import type { Prisma } from '@prisma/client';

/** Decoded tech-stack tag list. Stored as JSON in SQLite. */
export type TechTag = string;

export type ProjectCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  techStack: TechTag[];
  publishedAt: Date | null;
};

export type ProjectDetail = ProjectCard & {
  body: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  updatedAt: Date;
};

function decodeTechStack(raw: string): TechTag[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((t) => typeof t === 'string')) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

type RawProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  techStack: string;
  publishedAt: Date | null;
  body?: string | null;
  repoUrl?: string | null;
  liveUrl?: string | null;
  featured?: boolean;
  updatedAt?: Date;
};

function toCard(row: RawProject): ProjectCard {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    techStack: decodeTechStack(row.techStack),
    publishedAt: row.publishedAt,
  };
}

function toDetail(row: RawProject): ProjectDetail {
  return {
    ...toCard(row),
    body: row.body ?? null,
    repoUrl: row.repoUrl ?? null,
    liveUrl: row.liveUrl ?? null,
    featured: row.featured ?? false,
    updatedAt: row.updatedAt ?? new Date(0),
  };
}

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  imageUrl: true,
  techStack: true,
  publishedAt: true,
} satisfies Prisma.ProjectSelect;

const detailSelect = {
  ...cardSelect,
  body: true,
  repoUrl: true,
  liveUrl: true,
  featured: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

/** All projects with publishedAt set, newest first. For the Projects index. */
export async function listPublishedProjects(): Promise<ProjectCard[]> {
  const rows = await db.project.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    select: cardSelect,
  });
  return rows.map(toCard);
}

/** Featured + published, ordered by featuredOrder then newest. For the Home page. */
export async function getFeaturedProjects(
  limit = 3,
): Promise<ProjectCard[]> {
  const safeLimit = Math.max(1, Math.floor(limit));
  const rows = await db.project.findMany({
    where: { featured: true, publishedAt: { not: null } },
    orderBy: [{ featuredOrder: 'asc' }, { publishedAt: 'desc' }],
    take: safeLimit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

/**
 * Featured projects for the home page, with an honest fallback when
 * the admin hasn't flagged anything yet. Returns up to `limit` rows:
 *   - first: anything with featured=true (ordered by featuredOrder)
 *   - then:  fill the remaining slots with the most recent published
 *            projects, so the home page never looks empty just because
 *            curation hasn't happened yet.
 * No fabricated data — if zero projects are published, the section
 * hides itself.
 */
export async function getHomepageProjects(
  limit = 3,
): Promise<ProjectCard[]> {
  const safeLimit = Math.max(1, Math.floor(limit));
  const featured = await getFeaturedProjects(safeLimit);
  if (featured.length >= safeLimit) return featured;

  const seenIds = new Set(featured.map((p) => p.id));
  const fillers = await db.project.findMany({
    where: {
      publishedAt: { not: null },
      id: seenIds.size > 0 ? { notIn: Array.from(seenIds) } : undefined,
    },
    orderBy: { publishedAt: 'desc' },
    take: safeLimit - featured.length,
    select: cardSelect,
  });
  return [...featured, ...fillers.map(toCard)];
}

/** Single project by URL slug. Returns null if not found. */
export async function getProjectBySlug(
  slug: string,
): Promise<ProjectDetail | null> {
  if (!slug) return null;
  const row = await db.project.findUnique({
    where: { slug },
    select: detailSelect,
  });
  return row ? toDetail(row) : null;
}
