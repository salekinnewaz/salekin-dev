// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/queries/projects', () => ({
  getProjectBySlug: vi.fn(),
  listPublishedProjects: vi.fn(),
}));

import {
  getProjectBySlug,
  listPublishedProjects,
} from '@/lib/queries/projects';
import type { ProjectDetail } from '@/lib/queries/projects';
import ProjectSlugPage from './page';

function makeDetail(overrides: Partial<ProjectDetail> = {}): ProjectDetail {
  return {
    id: 'p1',
    slug: 'specsmd',
    title: 'specsmd',
    description: 'A planning framework.',
    body: 'Hello **world** and `code`.',
    imageUrl: null,
    techStack: ['TypeScript', 'Node.js'],
    publishedAt: new Date('2026-01-01T00:00:00Z'),
    repoUrl: 'https://github.com/me/specsmd',
    liveUrl: 'https://specsmd.example.com',
    featured: false,
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listPublishedProjects).mockResolvedValue([]);
});

describe('ProjectSlugPage', () => {
  it('renders project title, description, body, and links', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(makeDetail());
    const ui = await ProjectSlugPage({ params: Promise.resolve({ slug: 'specsmd' }) });
    render(ui);
    expect(
      screen.getByRole('heading', { level: 1, name: 'specsmd' }),
    ).toBeInTheDocument();
    expect(screen.getByText('A planning framework.')).toBeInTheDocument();
    const live = screen.getByRole('link', { name: /view live/i });
    expect(live.getAttribute('href')).toBe('https://specsmd.example.com');
    const repo = screen.getByRole('link', { name: /source/i });
    expect(repo.getAttribute('href')).toBe('https://github.com/me/specsmd');
    // Body is rendered as a <strong> (from **world**)
    expect(screen.getByText('world').tagName).toBe('STRONG');
  });

  it('renders the tech stack pills', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(makeDetail());
    const ui = await ProjectSlugPage({ params: Promise.resolve({ slug: 'specsmd' }) });
    render(ui);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('renders a back-to-projects breadcrumb', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(makeDetail());
    const ui = await ProjectSlugPage({ params: Promise.resolve({ slug: 'specsmd' }) });
    render(ui);
    const back = screen.getByRole('link', { name: /ls \.\./i });
    expect(back.getAttribute('href')).toBe('/projects');
  });

  it('renders the "more projects" rail when siblings exist', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(makeDetail({ slug: 'specsmd' }));
    vi.mocked(listPublishedProjects).mockResolvedValue([
      makeDetail({ id: 'a', slug: 'specsmd' }),
      makeDetail({ id: 'b', slug: 'shift', title: 'Shift Scheduler' }),
      makeDetail({ id: 'c', slug: 'inv', title: 'Inventory' }),
    ]);
    const ui = await ProjectSlugPage({ params: Promise.resolve({ slug: 'specsmd' }) });
    render(ui);
    expect(screen.getByText('Shift Scheduler')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('hides repo/live links when not provided', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(
      makeDetail({ repoUrl: null, liveUrl: null }),
    );
    const ui = await ProjectSlugPage({ params: Promise.resolve({ slug: 'specsmd' }) });
    render(ui);
    expect(screen.queryByRole('link', { name: /view live/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /source/i })).toBeNull();
  });

  it('throws notFound() when the slug does not resolve', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(null);
    await expect(
      ProjectSlugPage({ params: Promise.resolve({ slug: 'nope' }) }),
    ).rejects.toThrow();
  });
});
