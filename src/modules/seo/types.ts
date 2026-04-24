export type TwitterCard = 'summary' | 'summary_large_image';
export type RobotsDirective = 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow';

/** Canonical SEO data shape — used by both the form and the resolver. */
export interface SeoData {
  page: string;
  metaTitle: string;
  metaDescription: string | null;
  keywords: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: TwitterCard;
  canonicalUrl: string | null;
  structuredData: Record<string, unknown> | Record<string, unknown>[] | null;
  robots: RobotsDirective;
}

/** Minimal partial form input used when the admin saves a page's SEO. */
export type SeoFormInput = Omit<SeoData, 'page'>;

/** Module-default partial — every module's `data/defaults.ts` exports one of these. */
export type SeoDefaults = Partial<Omit<SeoData, 'page'>>;

/** Row shape returned by the API list endpoint. */
export interface SeoListItem {
  id: string;
  page: string;
  metaTitle: string;
  metaDescription: string | null;
  robots: RobotsDirective;
  updatedAt: string;
}
