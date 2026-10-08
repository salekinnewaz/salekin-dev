import { describe, it, expect } from 'vitest';
import { buildDataExport } from './export';

function isoString(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(s);
}

describe('queries/export', () => {
  it('returns a versioned snapshot of the live test database', async () => {
    const snap = await buildDataExport();
    expect(snap.schemaVersion).toBe(1);
    expect(isoString(snap.generatedAt)).toBe(true);
    expect(Object.keys(snap.data).sort()).toEqual(
      ['contacts', 'cvDownloads', 'education', 'experiences', 'projects', 'settings'].sort(),
    );
    // Counts are non-negative integers and match the data length.
    expect(snap.counts.projects).toBeGreaterThanOrEqual(0);
    expect(snap.counts.experiences).toBeGreaterThanOrEqual(0);
    expect(snap.counts.education).toBeGreaterThanOrEqual(0);
    expect(snap.counts.contacts).toBeGreaterThanOrEqual(0);
    expect(snap.counts.settings).toBeGreaterThanOrEqual(0);
    expect(snap.counts.cvDownloads).toBeGreaterThanOrEqual(0);
    expect(snap.data.projects.length).toBe(snap.counts.projects);
    expect(snap.data.experiences.length).toBe(snap.counts.experiences);
    expect(snap.data.education.length).toBe(snap.counts.education);
    expect(snap.data.contacts.length).toBe(snap.counts.contacts);
    expect(snap.data.settings.length).toBe(snap.counts.settings);
    expect(snap.data.cvDownloads.length).toBe(snap.counts.cvDownloads);
  });

  it('every date column is serialized as an ISO string', async () => {
    const snap = await buildDataExport();
    for (const p of snap.data.projects) {
      expect(isoString(p.createdAt)).toBe(true);
      expect(isoString(p.updatedAt)).toBe(true);
      if (p.publishedAt) expect(isoString(p.publishedAt)).toBe(true);
    }
    for (const e of snap.data.experiences) {
      expect(isoString(e.startDate)).toBe(true);
      expect(isoString(e.createdAt)).toBe(true);
      if (e.endDate) expect(isoString(e.endDate)).toBe(true);
    }
    for (const c of snap.data.contacts) {
      expect(isoString(c.createdAt)).toBe(true);
    }
    for (const s of snap.data.settings) {
      expect(isoString(s.updatedAt)).toBe(true);
    }
    for (const d of snap.data.cvDownloads) {
      expect(isoString(d.createdAt)).toBe(true);
    }
    // And JSON.stringify doesn't throw (would throw on a Date instance).
    expect(() => JSON.stringify(snap)).not.toThrow();
  });

  it('nullables stay null (not undefined, not "")', async () => {
    const snap = await buildDataExport();
    for (const e of snap.data.experiences) {
      expect(e.endDate === null || typeof e.endDate === 'string').toBe(true);
    }
    for (const c of snap.data.contacts) {
      expect(typeof c.message).toBe('string');
      expect(c.message.length).toBeGreaterThan(0);
    }
    for (const p of snap.data.projects) {
      expect(p.body === null || typeof p.body === 'string').toBe(true);
      expect(p.imageUrl === null || typeof p.imageUrl === 'string').toBe(true);
    }
  });
});