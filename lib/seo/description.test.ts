import { describe, it, expect } from 'vitest';
import {
  normalizeMetaDescription,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from './description';

describe('normalizeMetaDescription', () => {
  it('leaves an in-range description untouched', () => {
    const text =
      'A perfectly sized description that sits comfortably inside the accepted window for search engines to display.';
    expect([...text].length).toBeGreaterThanOrEqual(MIN_DESCRIPTION_LENGTH);
    expect([...text].length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect(normalizeMetaDescription(text)).toBe(text);
  });

  it('trims an over-long description to the maximum', () => {
    const text =
      'QA across 4+ concurrent international projects in logistics, oil & gas, IoT, e-commerce and rideshare. Add the real client + project copy in the admin panel.';
    const out = normalizeMetaDescription(text);
    expect([...out].length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect([...out].length).toBeGreaterThanOrEqual(MIN_DESCRIPTION_LENGTH);
  });

  it('cuts at a sentence boundary when one fits', () => {
    const text =
      'First sentence that runs on for a while and is comfortably long. Second sentence that also adds a great deal of extra length to the string.';
    const out = normalizeMetaDescription(text);
    expect(out.endsWith('.')).toBe(true);
    expect([...out].length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
  });

  it('does not cut mid-word', () => {
    const text = `${'word '.repeat(60)}`;
    const out = normalizeMetaDescription(text);
    expect(out.endsWith('word')).toBe(true);
    expect([...out].length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
  });

  it('pads a too-short description to reach the minimum', () => {
    const out = normalizeMetaDescription('Short copy.');
    expect([...out].length).toBeGreaterThanOrEqual(MIN_DESCRIPTION_LENGTH);
    expect([...out].length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect(out.startsWith('Short copy.')).toBe(true);
  });

  it('returns an empty string for missing input', () => {
    expect(normalizeMetaDescription(null)).toBe('');
    expect(normalizeMetaDescription(undefined)).toBe('');
    expect(normalizeMetaDescription('   ')).toBe('');
  });

  it('keeps the ESCAPED length inside the window', () => {
    // `&` renders as `&amp;`, so a raw string of 157 characters can
    // occupy 161 characters in the HTML. The normaliser must bound the
    // escaped length, not the raw one.
    const text =
      'QA across 4+ concurrent international projects in logistics, oil & gas, IoT, e-commerce and rideshare. Add the real client + project copy in the admin panel.';
    const out = normalizeMetaDescription(text);
    const escaped = out.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    expect([...escaped].length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect([...escaped].length).toBeGreaterThanOrEqual(MIN_DESCRIPTION_LENGTH);
  });

  it('always produces an in-range result', () => {
    const samples = [
      'x',
      'Short.',
      'a'.repeat(500),
      'Sentence one. ' + 'b'.repeat(300),
      'End with period.',
      'Ampersands & angle <brackets> ' + 'x'.repeat(200),
    ];
    for (const s of samples) {
      const out = normalizeMetaDescription(s);
      if (out.length === 0) continue;
      const escaped = out
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      expect([...escaped].length).toBeGreaterThanOrEqual(MIN_DESCRIPTION_LENGTH);
      expect([...escaped].length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    }
  });
});
