// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pill } from './Pill';

describe('Pill', () => {
  it('renders children', () => {
    render(<Pill>TypeScript</Pill>);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('applies an additional className alongside defaults', () => {
    render(<Pill className="custom-class">React</Pill>);
    const el = screen.getByText('React');
    expect(el.className).toContain('custom-class');
    expect(el.className).toContain('rounded-full');
  });

  it('renders without crashing when className is omitted', () => {
    render(<Pill>Only child</Pill>);
    expect(screen.getByText('Only child')).toBeInTheDocument();
  });
});