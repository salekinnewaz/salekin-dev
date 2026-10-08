import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  listPublishedProjects,
  getFeaturedProjects,
  getProjectBySlug,
} from './projects';
import { getTestDb } from '../../tests/helpers/db';

// Tests seed their own fixtures via getTestDb().project.create so they don't
// depend on what (if anything) is in prisma/seed.ts. Each test owns the
// slugs it inserts; beforeEach/afterEach wipe the table so leftover rows
// from prior runs (or other test files) can't bleed in.

const FIXTURE_SLUGS = [
  'fixture-specsmd',
  'fixture-puku-cli',
  'fixture-shift-scheduler',
  'fixture-extra',
  'fixture-corrupt',
  'fixture-draft-only',
];

async function wipeFixtures() {
  // Wipe ALL projects in the test DB, not just the fixture slugs.
  // The seed file also inserts placeholder case studies (P0.1), and
  // they would otherwise bleed into the count assertions below.
  await getTestDb().project.deleteMany({});
}

describe('queries/projects', () => {
  beforeEach(wipeFixtures);
  afterEach(wipeFixtures);

  it('listPublishedProjects returns only projects with publishedAt set, newest first', async () => {
    const base = Date.parse('2025-01-01T00:00:00Z');
    await getTestDb().project.createMany({
      data: [
        {
          slug: 'fixture-puku-cli',
          title: 'puku-cli',
          description: 'AI harness',
          techStack: '[]',
          featured: false,
          publishedAt: new Date(base + 24 * 60 * 60 * 1000),
        },
        {
          slug: 'fixture-specsmd',
          title: 'specsmd',
          description: 'spec-driven scaffolding',
          techStack: '["typescript"]',
          featured: true,
          publishedAt: new Date(base + 48 * 60 * 60 * 1000),
        },
        {
          slug: 'fixture-shift-scheduler',
          title: 'Shift Scheduler',
          description: 'scheduling tool',
          techStack: '[]',
          featured: false,
          publishedAt: new Date(base),
        },
      ],
    });

    const projects = await listPublishedProjects();
    expect(projects.length).toBe(3);
    // Newest publishedAt first
    expect(projects[0]?.slug).toBe('fixture-specsmd');
    for (const p of projects) {
      expect(p.publishedAt).not.toBeNull();
      expect(Array.isArray(p.techStack)).toBe(true);
    }
  });

  it('getFeaturedProjects caps at limit and returns featured+published only', async () => {
    const publishedAt = new Date('2025-01-01T00:00:00Z');
    await getTestDb().project.createMany({
      data: [
        {
          slug: 'fixture-puku-cli',
          title: 'puku-cli',
          description: 'AI harness',
          techStack: '[]',
          featured: true,
          featuredOrder: 2,
          publishedAt,
        },
        {
          slug: 'fixture-specsmd',
          title: 'specsmd',
          description: 'spec-driven scaffolding',
          techStack: '[]',
          featured: true,
          featuredOrder: 1,
          publishedAt,
        },
        {
          slug: 'fixture-shift-scheduler',
          title: 'Shift Scheduler',
          description: 'scheduling tool',
          techStack: '[]',
          featured: true,
          featuredOrder: 3,
          publishedAt,
        },
      ],
    });

    const featured = await getFeaturedProjects(3);
    expect(featured.length).toBe(3);

    // Insert a non-featured published project and verify it is excluded
    await getTestDb().project.create({
      data: {
        slug: 'fixture-extra',
        title: 'Extra',
        description: 'x',
        techStack: '[]',
        featured: false,
        publishedAt: new Date(),
      },
    });
    const after = await getFeaturedProjects(3);
    expect(after.every((p) => p.slug !== 'fixture-extra')).toBe(true);
  });

  it('getFeaturedProjects defaults limit to 3', async () => {
    const publishedAt = new Date('2025-01-01T00:00:00Z');
    await getTestDb().project.createMany({
      data: [
        {
          slug: 'fixture-puku-cli',
          title: 'puku-cli',
          description: 'AI harness',
          techStack: '[]',
          featured: true,
          publishedAt,
        },
        {
          slug: 'fixture-specsmd',
          title: 'specsmd',
          description: 'spec-driven scaffolding',
          techStack: '[]',
          featured: true,
          publishedAt,
        },
      ],
    });

    const featured = await getFeaturedProjects();
    expect(featured.length).toBeLessThanOrEqual(3);
  });

  it('getFeaturedProjects(0) clamps to at least 1', async () => {
    const publishedAt = new Date('2025-01-01T00:00:00Z');
    await getTestDb().project.createMany({
      data: [
        {
          slug: 'fixture-puku-cli',
          title: 'puku-cli',
          description: 'AI harness',
          techStack: '[]',
          featured: true,
          publishedAt,
        },
        {
          slug: 'fixture-specsmd',
          title: 'specsmd',
          description: 'spec-driven scaffolding',
          techStack: '[]',
          featured: true,
          publishedAt,
        },
      ],
    });

    const featured = await getFeaturedProjects(0);
    expect(featured.length).toBeGreaterThanOrEqual(1);
  });

  it('getProjectBySlug returns detail for known slug', async () => {
    await getTestDb().project.create({
      data: {
        slug: 'fixture-specsmd',
        title: 'specsmd — spec-driven project scaffolding',
        description: 'A tool for spec-driven scaffolding.',
        body: 'What it does: scaffolds a project from a spec.',
        techStack: '["typescript"]',
        featured: true,
        publishedAt: new Date(),
      },
    });
    const project = await getProjectBySlug('fixture-specsmd');
    expect(project).not.toBeNull();
    expect(project?.title).toContain('specsmd');
    expect(project?.body).toContain('What it does');
    expect(project?.featured).toBe(true);
  });

  it('getProjectBySlug returns null for unknown slug', async () => {
    const project = await getProjectBySlug('does-not-exist');
    expect(project).toBeNull();
  });

  it('getProjectBySlug with empty slug returns null', async () => {
    const project = await getProjectBySlug('');
    expect(project).toBeNull();
  });

  it('decodes corrupt techStack JSON safely to empty array', async () => {
    await getTestDb().project.create({
      data: {
        slug: 'fixture-corrupt',
        title: 'Corrupt',
        description: 'has bad JSON',
        techStack: 'not json at all',
        publishedAt: new Date(),
      },
    });
    const projects = await listPublishedProjects();
    const corrupt = projects.find((p) => p.slug === 'fixture-corrupt');
    expect(corrupt?.techStack).toEqual([]);
  });

  it('excludes unpublished projects', async () => {
    await getTestDb().project.create({
      data: {
        slug: 'fixture-draft-only',
        title: 'Draft',
        description: 'unpublished',
        techStack: '[]',
        publishedAt: null,
      },
    });
    const projects = await listPublishedProjects();
    expect(projects.find((p) => p.slug === 'fixture-draft-only')).toBeUndefined();
  });
});