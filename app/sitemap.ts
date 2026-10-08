import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { listPublishedProjects } from '@/lib/queries/projects';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.SITE_URL ?? 'http://localhost:3000';
  const now = new Date();

  const projects = await listPublishedProjects();

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${base}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: p.publishedAt ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    {
      url: `${base}/#about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/#experience`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/#skills`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/#education`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/#contact`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
  ];
}