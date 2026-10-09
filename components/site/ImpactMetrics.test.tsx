// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImpactMetrics } from './ImpactMetrics';

describe('ImpactMetrics', () => {
  it('renders 4 stat cards with the headline numbers', () => {
    render(<ImpactMetrics />);
    // Each metric surfaces a value, a unit, and a label. The "4+" value
    // appears for both years and projects, so we use getAllByText.
    expect(screen.getAllByText(/4\+/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/^3$/)).toBeInTheDocument();
    expect(screen.getByText(/60%/)).toBeInTheDocument();
  });

  it('labels each card with a human-readable metric', () => {
    render(<ImpactMetrics />);
    expect(screen.getByText(/Years Experience/i)).toBeInTheDocument();
    expect(screen.getByText(/International Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Production Releases/i)).toBeInTheDocument();
    expect(screen.getByText(/Regression Time/i)).toBeInTheDocument();
  });

  it('uses the card class so all metrics share the same surface treatment', () => {
    const { container } = render(<ImpactMetrics />);
    const cards = container.querySelectorAll('.card');
    expect(cards.length).toBe(4);
  });
});
