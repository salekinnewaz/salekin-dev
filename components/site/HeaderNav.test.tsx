// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

import { HeaderNav } from './HeaderNav';

const allVisible = {
  hero: true,
  work: true,
  about: true,
  experience: true,
  skills: true,
  contact: true,
  recommendations: true,
} as const;

describe('HeaderNav', () => {
  beforeEach(() => {
    // Provide the sections the observer will try to attach to. Match
    // the current NAV_SECTIONS list (Education is no longer a top-nav
    // destination).
    for (const id of ['hero', 'work', 'about', 'experience', 'skills', 'contact', 'recommendations']) {
      const el = document.createElement('section');
      el.id = id;
      document.body.appendChild(el);
    }
  });

  it('renders a link for every visible section (except hero, which is the brand)', () => {
    render(<HeaderNav visible={allVisible} />);
    // "Home" is intentionally NOT in the pill nav — the brand mark on
    // the left of the header already serves as the "go home" link, and
    // rendering both would visually mark two items as the current page
    // on `/`.
    for (const label of [
      'Work',
      'Experience',
      'Recommendations',
      'Stack',
      'About',
      'Contact',
    ]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('link', { name: /^home$/i })).toBeNull();
  });

  it('hides links for sections turned off in admin settings', () => {
    render(
      <HeaderNav
        visible={{
          ...allVisible,
          skills: false,
          experience: false,
          work: false,
        }}
      />,
    );
    expect(screen.queryByText('Stack')).not.toBeInTheDocument();
    expect(screen.queryByText('Experience')).not.toBeInTheDocument();
    expect(screen.queryByText('Work')).not.toBeInTheDocument();
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
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
    // "Home" is intentionally not in the pill nav (the brand mark
    // serves as the "go home" link). No pill is active until the
    // user clicks one or the scroll-spy IO fires.
    const work = screen.getAllByRole('link', { name: /^work$/i })[0]!;
    expect(work.dataset.active).toBeUndefined();
    expect(work.querySelector('.pill-nav__indicator')).not.toBeInTheDocument();

    const about = screen.getByRole('link', { name: /^about$/i });
    expect(about.dataset.active).toBeUndefined();
    fireEvent.click(about);
    expect(about.dataset.active).toBe('true');
    expect(about.querySelector('.pill-nav__indicator')).toBeInTheDocument();
    expect(work.dataset.active).toBeUndefined();
    expect(work.querySelector('.pill-nav__indicator')).not.toBeInTheDocument();
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
      const skills = screen.getByRole('link', { name: /^stack$/i });
      expect(skills.dataset.active).toBe('true');
      expect(skills.querySelector('.pill-nav__indicator')).toBeInTheDocument();
    });
  });
});

describe('HeaderNav off-home behaviour', () => {
  beforeEach(() => {
    for (const id of ['hero', 'work', 'about', 'experience', 'skills', 'contact', 'recommendations']) {
      const el = document.createElement('section');
      el.id = id;
      document.body.appendChild(el);
    }
    vi.resetModules();
    vi.doMock('next/navigation', () => ({ usePathname: () => '/projects' }));
  });

  it('routes section links back to /#section when not on home', async () => {
    const { HeaderNav: OffHomeNav } = await import('./HeaderNav');
    render(<OffHomeNav visible={allVisible} />);
    const work = screen.getAllByRole('link', { name: /^work$/i })[0];
    expect(work?.getAttribute('href')).toBe('/#work');
  });
});
