import { db } from '../db';

/**
 * Full-database export used by the admin backup endpoint.
 *
 * Returned shape is a stable, version-tagged JSON document so consumers can
 * detect (and reject) snapshots that target a different field.
 */
export type DataExport = {
  schemaVersion: 1;
  generatedAt: string;
  counts: {
    projects: number;
    experiences: number;
    education: number;
    contacts: number;
    settings: number;
    cvDownloads: number;
  };
  data: {
    projects: ExportRow<ProjectExport>[];
    experiences: ExportRow<ExperienceExport>[];
    education: ExportRow<EducationExport>[];
    contacts: ExportRow<ContactExport>[];
    settings: ExportRow<SettingExport>[];
    cvDownloads: ExportRow<CvDownloadExport>[];
  };
};

type ExportRow<T> = T;

type ExperienceExport = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  bullets: string | null;
  sortOrder: number;
  createdAt: string;
};

type EducationExport = {
  id: string;
  institution: string;
  degree: string;
  startYear: number;
  endYear: number;
  description: string | null;
  sortOrder: number;
};

type ProjectExport = {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string | null;
  imageUrl: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  techStack: string;
  featured: boolean;
  featuredOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ContactExport = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type SettingExport = {
  key: string;
  value: string;
  updatedAt: string;
};

type CvDownloadExport = {
  id: string;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  createdAt: string;
};

/**
 * Build a full snapshot of every table. Dates are converted to ISO strings so
 * the resulting object is plain JSON (no `Date` instances to surprise callers).
 */
export async function buildDataExport(): Promise<DataExport> {
  const [
    projects,
    experiences,
    education,
    contacts,
    settings,
    cvDownloads,
  ] = await Promise.all([
    db.project.findMany(),
    db.experience.findMany(),
    db.education.findMany(),
    db.contact.findMany(),
    db.setting.findMany(),
    db.cvDownload.findMany(),
  ]);

  const toIso = (d: Date) => d.toISOString();

  const data: DataExport['data'] = {
    projects: projects.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      body: p.body,
      imageUrl: p.imageUrl,
      repoUrl: p.repoUrl,
      liveUrl: p.liveUrl,
      techStack: p.techStack,
      featured: p.featured,
      featuredOrder: p.featuredOrder,
      publishedAt: p.publishedAt ? toIso(p.publishedAt) : null,
      createdAt: toIso(p.createdAt),
      updatedAt: toIso(p.updatedAt),
    })),
    experiences: experiences.map((e) => ({
      id: e.id,
      company: e.company,
      role: e.role,
      startDate: toIso(e.startDate),
      endDate: e.endDate ? toIso(e.endDate) : null,
      description: e.description,
      bullets: e.bullets,
      sortOrder: e.sortOrder,
      createdAt: toIso(e.createdAt),
    })),
    education: education.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      startYear: e.startYear,
      endYear: e.endYear,
      description: e.description,
      sortOrder: e.sortOrder,
    })),
    contacts: contacts.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      message: c.message,
      createdAt: toIso(c.createdAt),
      read: c.read,
    })),
    settings: settings.map((s) => ({
      key: s.key,
      value: s.value,
      updatedAt: toIso(s.updatedAt),
    })),
    cvDownloads: cvDownloads.map((d) => ({
      id: d.id,
      ip: d.ip,
      userAgent: d.userAgent,
      referer: d.referer,
      createdAt: toIso(d.createdAt),
    })),
  };

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    counts: {
      projects: data.projects.length,
      experiences: data.experiences.length,
      education: data.education.length,
      contacts: data.contacts.length,
      settings: data.settings.length,
      cvDownloads: data.cvDownloads.length,
    },
    data,
  };
}