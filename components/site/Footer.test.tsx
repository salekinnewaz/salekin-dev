// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the current year as a 4-digit number', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument();
  });

  it('renders the owner name next to the copyright', () => {
    render(<Footer />);
    expect(screen.getByText('Md Salekin Newaz')).toBeInTheDocument();
  });

  it('renders the verified contact email as a mailto link', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'salekinnewaz0@gmail.com' });
    expect(link.getAttribute('href')).toBe('mailto:salekinnewaz0@gmail.com');
  });

  it('renders the verified phone number as a tel link', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: '+880 1640-8369595' });
    expect(link.getAttribute('href')).toBe('tel:+88016408369595');
  });

  it('renders the verified LinkedIn and GitHub profile links', () => {
    render(<Footer />);
    const linkedin = screen.getByRole('link', { name: 'LinkedIn' });
    expect(linkedin.getAttribute('href')).toBe(
      'https://www.linkedin.com/in/md-salekin-newaz',
    );
    const github = screen.getByRole('link', { name: 'GitHub' });
    expect(github.getAttribute('href')).toBe(
      'https://github.com/salekin-newaz',
    );
  });

  it('exposes a resume button that opens the printable resume modal', () => {
    render(<Footer />);
    const button = screen.getByRole('button', { name: 'Resume' });
    expect(button).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
