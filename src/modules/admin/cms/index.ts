// CMS — single source of truth for admin-managed pages.
// Consumed by the admin sidebar, SEO manager and the Analytics dashboard.

import { CMS_MODULES } from './pages';
import type { CmsModule, CmsPage } from './types';

export { CMS_MODULES };
export type { CmsModule, CmsPage };

/** All CMS modules, sorted by order. */
export function getCmsModules(): CmsModule[] {
  return [...CMS_MODULES].sort((a, b) => a.order - b.order);
}

export function getCmsModule(id: string): CmsModule | undefined {
  return CMS_MODULES.find((m) => m.id === id);
}

/** Flattened list of every page that has an SEO tab (for the SEO manager). */
export function getSeoPages(): CmsPage[] {
  return getCmsModules().flatMap((m) => m.pages.filter((p) => p.seo));
}
