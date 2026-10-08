import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listExperiencesOrdered } from './experiences';
import { getTestDb } from '../../tests/helpers/db';

// Tests seed their own fixtures via getTestDb().experience.create so they
// don't depend on what (if anything) is in prisma/seed.ts. beforeEach /
// afterEach wipe everything in the experience table so leftover rows from
// prior runs (e.g. an "Acme" placeholder) can't shift the ordering.

async function wipeAll() {
  await getTestDb().experience.deleteMany({});
}

describe('queries/experiences', () => {
  beforeEach(wipeAll);
  afterEach(wipeAll);

  it('returns experiences sorted by sortOrder asc', async () => {
    await getTestDb().experience.createMany({
      data: [
        {
          company: 'Older Co',
          role: 'Old role',
          startDate: new Date('2020-01-01T00:00:00Z'),
          endDate: new Date('2021-01-01T00:00:00Z'),
          description: null,
          bullets: '["old"]',
          sortOrder: 2,
        },
        {
          company: 'Braintree Technologies',
          role: 'Jr. Software Engineer (DSE)',
          startDate: new Date('2025-09-01T00:00:00Z'),
          endDate: null,
          description: 'Current role.',
          bullets: '["current"]',
          sortOrder: 1,
        },
      ],
    });

    const items = await listExperiencesOrdered();
    expect(items.length).toBeGreaterThanOrEqual(2);
    // sortOrder 1 = Braintree Jr. Software Engineer (current)
    expect(items[0]?.company).toBe('Braintree Technologies');
    expect(items[0]?.role).toContain('Jr. Software Engineer');
  });

  it('preserves null endDate (current role)', async () => {
    await getTestDb().experience.createMany({
      data: [
        {
          company: 'Older Co',
          role: 'Old role',
          startDate: new Date('2020-01-01T00:00:00Z'),
          endDate: new Date('2021-01-01T00:00:00Z'),
          description: null,
          bullets: '[]',
          sortOrder: 2,
        },
        {
          company: 'Current Co',
          role: 'Current role',
          startDate: new Date('2025-01-01T00:00:00Z'),
          endDate: null,
          description: null,
          bullets: '[]',
          sortOrder: 1,
        },
      ],
    });

    const items = await listExperiencesOrdered();
    expect(items[0]?.endDate).toBeNull();
    // Last entry should have a non-null endDate
    expect(items[items.length - 1]?.endDate).not.toBeNull();
  });

  it('decodes bullets into string arrays', async () => {
    await getTestDb().experience.create({
      data: {
        company: 'Sample Co',
        role: 'Engineer',
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: null,
        description: null,
        bullets: JSON.stringify(['First bullet', 'Second bullet']),
        sortOrder: 1,
      },
    });

    const items = await listExperiencesOrdered();
    expect(Array.isArray(items[0]?.bullets)).toBe(true);
    expect(items[0]?.bullets.length).toBeGreaterThan(0);
    expect(items[0]?.bullets.every((b) => typeof b === 'string')).toBe(true);
  });
});