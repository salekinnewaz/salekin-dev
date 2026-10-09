// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Industries } from './Industries';

describe('Industries', () => {
  it('renders the eyebrow and heading', () => {
    render(<Industries />);
    expect(screen.getByText(/industries/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /domains i.{0,3}ve worked in/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders the 5 industry tags', () => {
    render(<Industries />);
    expect(screen.getByText(/Logistics/i)).toBeInTheDocument();
    expect(screen.getByText(/Oil .{0,3} Gas/i)).toBeInTheDocument();
    expect(screen.getByText(/IoT/i)).toBeInTheDocument();
    expect(screen.getByText(/E-commerce/i)).toBeInTheDocument();
    expect(screen.getByText(/Rideshare/i)).toBeInTheDocument();
  });
});
