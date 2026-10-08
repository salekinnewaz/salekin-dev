// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

import { redirect } from 'next/navigation';
import AboutPage from './page';

describe('AboutPage (redirect)', () => {
  it('redirects to /#about', async () => {
    await AboutPage();
    expect(redirect).toHaveBeenCalledWith('/#about');
  });
});