import type { ElementType } from 'react';

/** A single CMS-managed page (source of truth for the whole admin). */
export interface CmsPage {
  /** kebab-case id, unique within its module, e.g. 'the-story'. */
  id: string;
  name: string;
  icon: ElementType;
  /** Where the page is managed in the admin. */
  adminHref: string;
  /** Whether the page has an SEO tab (?tab=seo). */
  seo?: boolean;
}

/** A CMS module — a group of pages, e.g. "Our Essence". */
export interface CmsModule {
  /** kebab-case id, e.g. 'our-essence'. */
  id: string;
  name: string;
  icon: ElementType;
  /** The module hub in the admin. */
  adminHref: string;
  /** Display order (lower first). */
  order: number;
  pages: CmsPage[];
}
