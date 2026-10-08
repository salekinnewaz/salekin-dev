import { db } from '../db';

export type LogDownloadInput = {
  ip?: string | null;
  userAgent?: string | null;
  referer?: string | null;
};

/**
 * Record a CV download. Returns the new total count.
 */
export async function logCvDownload(
  input: LogDownloadInput,
): Promise<number> {
  await db.cvDownload.create({
    data: {
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      referer: input.referer ?? null,
    },
    select: { id: true },
  });
  return db.cvDownload.count();
}

/** Total downloads to date. */
export async function countCvDownloads(): Promise<number> {
  return db.cvDownload.count();
}