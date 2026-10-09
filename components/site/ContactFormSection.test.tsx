// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactFormSection } from './ContactFormSection';

describe('ContactFormSection', () => {
  it('renders the form section eyebrow and heading', () => {
    render(<ContactFormSection />);
    expect(screen.getByText(/contact form/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /drop a message/i }),
    ).toBeInTheDocument();
  });

  it('mounts the form with a name input', () => {
    render(<ContactFormSection />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('uses id=contact so the CTA button can scroll to it', () => {
    const { container } = render(<ContactFormSection />);
    expect(container.querySelector('#contact')).not.toBeNull();
  });
});
