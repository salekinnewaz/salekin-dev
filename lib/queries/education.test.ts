import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listEducationOrdered } from './education';
import { getTestDb } from '../../tests/helpers/db';

async function wipe() {
  await getTestDb().education.deleteMany({});
}

describe('queries/education', () => {
  beforeEach(wipe);
  afterEach(wipe);

  it('returns education ordered by sortOrder asc, then startYear desc', async () => {
    await getTestDb().education.createMany({
      data: [
        {
          institution: 'A',
          degree: 'Sort=2 entry',
          startYear: 2010,
          endYear: 2014,
          description: null,
          sortOrder: 2,
        },
        {
          institution: 'B',
          degree: 'Newer within sortOrder=1',
          startYear: 2018,
          endYear: 2022,
          description: null,
          sortOrder: 1,
        },
        {
          institution: 'C',
          degree: 'Older within sortOrder=1',
          startYear: 2014,
          endYear: 2018,
          description: null,
          sortOrder: 1,
        },
      ],
    });

    const items = await listEducationOrdered();
    // sortOrder=1 entries come first; within the same sortOrder, startYear
    // descending: B (2018) before C (2014). Then sortOrder=2 entry A.
    expect(items.map((e) => e.institution)).toEqual(['B', 'C', 'A']);
  });

  it('returns an empty array when no education rows exist', async () => {
    const items = await listEducationOrdered();
    expect(items).toEqual([]);
  });

  it('preserves the description column', async () => {
    await getTestDb().education.create({
      data: {
        institution: 'Sample U',
        degree: 'B.Sc.',
        startYear: 2020,
        endYear: 2024,
        description: 'CS major.',
        sortOrder: 1,
      },
    });
    const items = await listEducationOrdered();
    expect(items[0]?.description).toBe('CS major.');
  });
});