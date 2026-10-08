import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('returns empty string for no args', () => {
    expect(cn()).toBe('');
  });

  it('returns single class unchanged', () => {
    expect(cn('px-2')).toBe('px-2');
  });

  it('joins multiple classes with a single space', () => {
    expect(cn('px-2', 'py-1', 'rounded')).toBe('px-2 py-1 rounded');
  });

  it('filters out false values', () => {
    expect(cn('px-2', false, 'py-1')).toBe('px-2 py-1');
  });

  it('filters out null and undefined', () => {
    expect(cn('px-2', null, undefined, 'py-1')).toBe('px-2 py-1');
  });

  it('returns empty string when all args are falsy', () => {
    expect(cn(false, null, undefined)).toBe('');
  });

  it('handles empty strings without adding extra spaces', () => {
    expect(cn('', 'px-2', '', 'py-1', '')).toBe('px-2 py-1');
  });

  it('preserves classes containing internal whitespace', () => {
    expect(cn('text-base font-medium', 'text-fg')).toBe(
      'text-base font-medium text-fg',
    );
  });
});