// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeaderNav } from './HeaderNav';

const allVisible = {
  hero: true,
  about: true,
  experience: true,
  skills: true,
  education: true,
  contact: true,
} as const;

describe('HeaderNav', () => {
  beforeEach(() => {
    // Provide the sections the observer will try to attach to.
    for (const id of ['hero', 'about', 'experience', 'skills', 'education', 'contact']) {
      const el = document.createElement('section');
      el.id = id;
      document.body.appendChild(el);
    }
  });

  it('renders a link for every visible section', () => {
    render(<HeaderNav visible={allVisible} />);
    for (const label of ['Home', 'About', 'Work', 'Skills', 'Education', 'Contact']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it('hides links for sections turned off in admin settings', () => {
    render(
      <HeaderNav
        visible={{ ...allVisible, skills: false, education: false, experience: false }}
      />,
    );
    expect(screen.queryByText('Skills')).not.toBeInTheDocument();
    expect(screen.queryByText('Education')).not.toBeInTheDocument();
    expect(screen.queryByText('Work')).not.toBeInTheDocument();
    expect(screen.queryAllByText('About').length).toBeGreaterThan(0);
  });

  it('toggles the mobile drawer when the hamburger is clicked', () => {
    render(<HeaderNav visible={allVisible} />);
    const hamburger = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(hamburger);
    // Hamburger itself now announces "Close menu"; the drawer also has
    // an X close button. Both should be present.
    const closeButtons = screen.getAllByRole('button', { name: /close menu/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    // Click the X inside the drawer (not the hamburger itself) and verify
    // the hamburger reverts to "Open menu".
    const lastClose = closeButtons[closeButtons.length - 1];
    expect(lastClose).toBeDefined();
    fireEvent.click(lastClose!);
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('clicking a desktop pill moves the active highlight to that section', () => {
    render(<HeaderNav visible={allVisible} />);
    // Initially Home is active.
    const home = screen.getByRole('link', { name: /^home/i });
    expect(home.dataset.active).toBe('true');
    expect(home.querySelector('.pill-nav__indicator')).toBeInTheDocument();

    const about = screen.getByRole('link', { name: /^about$/i });
    expect(about.dataset.active).toBeUndefined();
    fireEvent.click(about);
    expect(about.dataset.active).toBe('true');
    expect(about.querySelector('.pill-nav__indicator')).toBeInTheDocument();
    expect(home.dataset.active).toBeUndefined();
    expect(home.querySelector('.pill-nav__indicator')).not.toBeInTheDocument();
  });

  it('honours a primed active section from the URL hash', () => {
    // Simulate the layout's boot script having read the URL hash and
    // primed the module-level published value.
    (window as unknown as { __specmdActive: string }).__specmdActive = 'skills';
    // The module's `published` was initialized at import time, so we
    // also reset it explicitly to match the primed hash.
    return import('@/lib/hooks/use-active-section').then((m) => {
      m.__resetActiveSectionForTests('skills');
      render(<HeaderNav visible={allVisible} />);
      const skills = screen.getByRole('link', { name: /^skills$/i });
      expect(skills.dataset.active).toBe('true');
      expect(skills.querySelector('.pill-nav__indicator')).toBeInTheDocument();
    });
  });
});
