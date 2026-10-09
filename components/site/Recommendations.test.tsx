// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Recommendations } from './Recommendations';

describe('Recommendations', () => {
  it('renders the eyebrow and heading', () => {
    render(<Recommendations linkedin={null} />);
    expect(screen.getByText(/trust .{0,3} recognition/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /what people say/i }),
    ).toBeInTheDocument();
  });

  it('renders 3 testimonial cards with names', () => {
    render(<Recommendations linkedin={null} />);
    expect(screen.getByText('Rahul Ahmed')).toBeInTheDocument();
    expect(screen.getByText('Nusrat Jahan')).toBeInTheDocument();
    expect(screen.getByText('Tariqul Islam')).toBeInTheDocument();
  });

  it('surfaces a LinkedIn link to the full recommendations page when provided', () => {
    render(
      <Recommendations linkedin="https://www.linkedin.com/in/example" />,
    );
    const link = screen.getByRole('link', {
      name: /read all recommendations/i,
    });
    expect(link.getAttribute('href')).toBe('https://www.linkedin.com/in/example');
  });

  it('hides the LinkedIn button when no URL is provided', () => {
    render(<Recommendations linkedin={null} />);
    expect(
      screen.queryByRole('link', { name: /read all recommendations/i }),
    ).toBeNull();
  });
});
