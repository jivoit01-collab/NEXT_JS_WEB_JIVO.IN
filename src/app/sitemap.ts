import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '',
    '/our-essence/the-story',
    '/our-essence/core-values',
    '/who-we-are',
    '/our-values',
    '/why-jivo',
    '/contact',
    '/canola-oil',
    '/olive-oil',
    '/wheatgrass',
    '/natural-minerals',
    '/shop',
    '/blog',
    '/privacy-policy',
    '/terms-and-conditions',
    '/refund-policy',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  // TODO: Add dynamic product and blog post URLs from database
  // const products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
  // const blogPosts = await prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } });

  return [...staticEntries];
}
