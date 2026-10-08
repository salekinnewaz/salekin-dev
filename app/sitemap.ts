import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { listPublishedProjects } from '@/lib/queries/projects';

// Sitemap policy notes:
//
//   - /about is INCLUDED. It's a real standalone page (was previously a
//     server-redirect to /#about). Listed separately so crawlers index
//     it as a distinct URL with its own canonical, OG, and JSON-LD.
//
//   - /contact is still a server-redirect to /#contact (see
//     app/contact/page.tsx). The hash anchor is listed below so the
//     section itself is surfaced without burning crawl budget on a
//     redirect target.
//
//   - /admin/* is omitted because robots.txt disallows it (see
//     app/robots.ts). The same rule applies for any future auth-gated
//     route.

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
    // Standalone /about — built deliberately for the "Md Salekin Newaz" name
    // query. Highest priority of the secondary routes because it's the
    // strongest indexable landing surface for the personal name aside from /.
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
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