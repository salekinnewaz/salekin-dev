// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/queries/projects', () => ({
  listPublishedProjects: vi.fn(),
}));

import { listPublishedProjects } from '@/lib/queries/projects';
import ProjectsPage from './page';
import type { ProjectCard as ProjectCardType } from '@/lib/queries/projects';

function makeProject(overrides: Partial<ProjectCardType> = {}): ProjectCardType {
  return {
    id: 'p1',
    slug: 'specsmd',
    title: 'specsmd',
    description: 'A planning framework.',
    techStack: ['TypeScript', 'Node.js'],
    imageUrl: null,
    publishedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProjectsPage', () => {
  it('renders a heading and a card per published project', async () => {
    vi.mocked(listPublishedProjects).mockResolvedValue([
      makeProject({ id: 'a', slug: 'alpha' }),
      makeProject({ id: 'b', slug: 'beta', title: 'beta' }),
    ]);
    const ui = await ProjectsPage();
    render(ui);
    expect(
      screen.getByRole('heading', { level: 1, name: /shipped/i }),
    ).toBeInTheDocument();
    // Both project titles render as h3
    expect(screen.getByRole('heading', { level: 3, name: 'specsmd' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'beta' })).toBeInTheDocument();
  });

  it('renders the count in mono when there are projects', async () => {
    vi.mocked(listPublishedProjects).mockResolvedValue([
      makeProject({ id: 'a', slug: 'alpha' }),
      makeProject({ id: 'b', slug: 'beta', title: 'beta' }),
    ]);
    const ui = await ProjectsPage();
    const { container } = render(ui);
    // Count badge is rendered with the .eyebrow__index class to keep it
    // visually distinct from the per-card "01"/"02" index badges.
    const badge = container.querySelector('.eyebrow__index');
    expect(badge?.textContent).toBe('02');
  });

  it('renders the empty state when no projects are published', async () => {
    vi.mocked(listPublishedProjects).mockResolvedValue([]);
    const ui = await ProjectsPage();
    render(ui);
    expect(
      screen.getByRole('heading', { level: 1, name: /shipped/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no published projects yet/i)).toBeInTheDocument();
    expect(screen.queryByTestId('projects-grid')).toBeNull();
  });

  it('renders a back-home link', async () => {
    vi.mocked(listPublishedProjects).mockResolvedValue([makeProject()]);
    const ui = await ProjectsPage();
    render(ui);
    const link = screen.getByRole('link', { name: /back home/i });
    expect(link.getAttribute('href')).toBe('/');
  });
});
