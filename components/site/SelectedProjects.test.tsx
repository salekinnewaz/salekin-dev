// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/queries/projects', () => ({
  getHomepageProjects: vi.fn().mockResolvedValue([]),
  getFeaturedProjects: vi.fn(),
  listPublishedProjects: vi.fn(),
}));

import { getHomepageProjects } from '@/lib/queries/projects';
import { SelectedProjects } from './SelectedProjects';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SelectedProjects', () => {
  const projects = [
    {
      id: 'p1',
      slug: 'one',
      title: 'Project One',
      description: 'First project.',
      imageUrl: null,
      techStack: ['Playwright'],
      publishedAt: new Date('2026-01-01T00:00:00Z'),
    },
    {
      id: 'p2',
      slug: 'two',
      title: 'Project Two',
      description: 'Second project.',
      imageUrl: null,
      techStack: ['TypeScript'],
      publishedAt: new Date('2026-02-01T00:00:00Z'),
    },
  ];

  it('renders the eyebrow and heading', async () => {
    vi.mocked(getHomepageProjects).mockResolvedValue(projects);
    const jsx = await SelectedProjects({ limit: 3 });
    render(jsx);
    expect(screen.getByText(/featured work/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /selected projects/i }),
    ).toBeInTheDocument();
  });

  it('links to /projects from the view-all button', async () => {
    vi.mocked(getHomepageProjects).mockResolvedValue(projects);
    const jsx = await SelectedProjects({ limit: 3 });
    render(jsx);
    const link = screen.getByRole('link', { name: /view all projects/i });
    expect(link.getAttribute('href')).toBe('/projects');
  });

  it('renders a card per project up to the limit', async () => {
    vi.mocked(getHomepageProjects).mockResolvedValue(projects);
    const jsx = await SelectedProjects({ limit: 3 });
    render(jsx);
    expect(screen.getByText(/Project One/)).toBeInTheDocument();
    expect(screen.getByText(/Project Two/)).toBeInTheDocument();
  });

  it('returns null when no projects are available', async () => {
    vi.mocked(getHomepageProjects).mockResolvedValue([]);
    const jsx = await SelectedProjects({ limit: 3 });
    const { container } = render(jsx);
    expect(container.firstChild).toBeNull();
  });
});
