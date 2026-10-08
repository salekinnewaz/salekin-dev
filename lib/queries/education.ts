import { db } from '../db';

export type EducationItem = {
  id: string;
  institution: string;
  degree: string;
  startYear: number;
  endYear: number;
  description: string | null;
  sortOrder: number;
};

export async function listEducationOrdered(): Promise<EducationItem[]> {
  const rows = await db.education.findMany({
    orderBy: [{ sortOrder: 'asc' }, { startYear: 'desc' }],
    select: {
      id: true,
      institution: true,
      degree: true,
      startYear: true,
      endYear: true,
      description: true,
      sortOrder: true,
    },
  });
  return rows;
}