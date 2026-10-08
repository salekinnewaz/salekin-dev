import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { logCvDownload, countCvDownloads } from './cv-downloads';
import { getTestDb } from '../../tests/helpers/db';

async function wipe() {
  await getTestDb().cvDownload.deleteMany({});
}

describe('queries/cv-downloads', () => {
  beforeEach(wipe);
  afterEach(wipe);

  it('logCvDownload persists a row and returns the new total count', async () => {
    const n1 = await logCvDownload({ ip: '1.1.1.1', userAgent: null, referer: null });
    const n2 = await logCvDownload({ ip: '2.2.2.2', userAgent: null, referer: null });
    expect(n1).toBe(1);
    expect(n2).toBe(2);
    const rows = await getTestDb().cvDownload.findMany();
    expect(rows).toHaveLength(2);
  });

  it('accepts null/undefined fields and stores them as null', async () => {
    await logCvDownload({});
    const row = await getTestDb().cvDownload.findFirst();
    expect(row?.ip).toBeNull();
    expect(row?.userAgent).toBeNull();
    expect(row?.referer).toBeNull();
  });

  it('countCvDownloads returns the running total', async () => {
    expect(await countCvDownloads()).toBe(0);
    await logCvDownload({ ip: '1.1.1.1' });
    expect(await countCvDownloads()).toBe(1);
  });
});