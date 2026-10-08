import { db } from '../db';

export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  bullets: string[];
  sortOrder: number;
};

function decodeBullets(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

/** All experience rows, ordered by sortOrder ASC, then newest startDate. */
export async function listExperiencesOrdered(): Promise<ExperienceItem[]> {
  const rows = await db.experience.findMany({
    orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
    select: {
      id: true,
      company: true,
      role: true,
      startDate: true,
      endDate: true,
      description: true,
      bullets: true,
      sortOrder: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    company: row.company,
    role: row.role,
    startDate: row.startDate,
    endDate: row.endDate,
    description: row.description,
    bullets: decodeBullets(row.bullets),
    sortOrder: row.sortOrder,
  }));
}