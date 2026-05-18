import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

/**
 * Sitemap - Only real pages with existing route files.
 *
 * Pages without route files (e.g., /products, /media, /community as main routes)
 * are EXCLUDED because they cause 404 crawl waste.
 *
 * Dropdown parent nav items (Products, Media, Community) have no page URLs
 * and therefore do NOT appear in sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { path: '', priority: 1 as const, changefreq: 'daily' as const },
    { path: '/our-essence/the-story', priority: 0.8 as const, changefreq: 'weekly' as const },
    { path: '/our-essence/core-values', priority: 0.8 as const, changefreq: 'weekly' as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map(({ path, priority, changefreq }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: changefreq,
    priority,
  }));

  return [...staticEntries];
}
