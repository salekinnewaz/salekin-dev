// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolsAndTechnologies } from './ToolsAndTechnologies';

describe('ToolsAndTechnologies', () => {
  it('renders the eyebrow and heading', () => {
    render(<ToolsAndTechnologies />);
    expect(screen.getByText(/core expertise/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /tools .{0,3} technologies/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders 5 category cards', () => {
    render(<ToolsAndTechnologies />);
    expect(screen.getByText(/Test Automation/i)).toBeInTheDocument();
    expect(screen.getByText(/API .{0,3} Contract Testing/i)).toBeInTheDocument();
    expect(screen.getByText(/Performance Testing/i)).toBeInTheDocument();
    expect(screen.getByText(/Cloud .{0,3} IoT/i)).toBeInTheDocument();
    expect(screen.getByText(/QA .{0,3} Delivery/i)).toBeInTheDocument();
  });

  it('links to the skills section anchor', () => {
    render(<ToolsAndTechnologies />);
    const link = screen.getByRole('link', { name: /view full stack/i });
    expect(link.getAttribute('href')).toBe('#skills');
  });
});
