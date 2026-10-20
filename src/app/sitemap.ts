import type { MetadataRoute } from 'next';
import { getProjects } from '@/lib/data';
import { siteUrl } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return [
    { url: `${siteUrl}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/trabalhos`, changeFrequency: 'monthly', priority: 0.8 },
    ...projects.map((p) => ({
      url: `${siteUrl}/projetos/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ];
}
