// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';
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

describe('ProjectCard', () => {
  it('renders title and description', () => {
    render(<ProjectCard project={makeProject()} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'specsmd',
    );
    expect(screen.getByText('A planning framework.')).toBeInTheDocument();
  });

  it('escapes HTML in description (renders as text)', () => {
    render(
      <ProjectCard
        project={makeProject({
          description:
            '<script>alert("xss")</script> This is a description with <em>tags</em>.',
        })}
      />,
    );
    // No script or em element should appear; everything is text.
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('em')).toBeNull();
    expect(
      screen.getByText(/<script>alert\("xss"\)<\/script>/),
    ).toBeInTheDocument();
  });

  it('renders each tech tag', () => {
    render(<ProjectCard project={makeProject()} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('omits the tech list when techStack is empty', () => {
    render(<ProjectCard project={makeProject({ techStack: [] })} />);
    expect(screen.queryByText('TypeScript')).toBeNull();
  });

  it('links to the project detail page', () => {
    render(<ProjectCard project={makeProject({ slug: 'shift-scheduler' })} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toContain('shift-scheduler');
  });

  it('does not render the index badge when index is omitted', () => {
    const { container } = render(<ProjectCard project={makeProject()} />);
    // No zero-padded index like "01" inside the cover
    expect(container.textContent).not.toMatch(/^0\d$/);
  });

  it('renders a zero-padded index badge when index is provided', () => {
    render(<ProjectCard project={makeProject()} index={7} />);
    expect(screen.getByText('07')).toBeInTheDocument();
  });

  it('caps tech pills at 4 and shows a +N overflow pill', () => {
    render(
      <ProjectCard
        project={makeProject({
          techStack: ['A', 'B', 'C', 'D', 'E', 'F'],
        })}
      />,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.queryByText('E')).toBeNull();
  });

  it('uses an <img> cover when imageUrl is present', () => {
    const { container } = render(
      <ProjectCard
        project={makeProject({ imageUrl: '/cover.png', slug: 'with-image' })}
        index={3}
      />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/cover.png');
  });

  it('falls back to the gradient SVG cover when no imageUrl', () => {
    const { container } = render(<ProjectCard project={makeProject()} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });
});