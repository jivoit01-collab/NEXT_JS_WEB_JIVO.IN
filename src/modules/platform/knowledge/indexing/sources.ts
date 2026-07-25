import 'server-only';

// ==========================================================================
// Source adapters + registry. Each knowledge source (CMS pages, products, …)
// plugs in by implementing SourceAdapter — the platform never hard-codes a
// source. CMS Pages is fully implemented; the rest are PREPARED plug-ins that
// return [] until their business module lands (register-then-implement).
// ==========================================================================

import { prisma } from '@/lib/db';
import type { RawKnowledgeItem, SourceAdapter } from '../types';
import { toPlainText } from '../utils';

// ── Registry ─────────────────────────────────────────────────
const globalRef = globalThis as typeof globalThis & {
  __jivoKnowledgeSources?: Map<string, SourceAdapter>;
};
const registry: Map<string, SourceAdapter> = globalRef.__jivoKnowledgeSources ?? new Map();
if (!globalRef.__jivoKnowledgeSources) globalRef.__jivoKnowledgeSources = registry;

export function registerSourceAdapter(adapter: SourceAdapter): void {
  registry.set(adapter.key, adapter);
}
export function getSourceAdapter(key: string): SourceAdapter | undefined {
  return registry.get(key);
}
export function getSourceAdapters(): SourceAdapter[] {
  return [...registry.values()];
}

// ── Helper: flatten any content JSON into searchable plain text ──
function flatten(value: unknown, out: string[] = []): string[] {
  if (value == null) return out;
  if (typeof value === 'string') {
    const t = value.trim();
    if (t) out.push(t);
  } else if (Array.isArray(value)) {
    for (const v of value) flatten(v, out);
  } else if (typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) flatten(v, out);
  }
  return out;
}

// ── CMS Pages adapter (REAL) ─────────────────────────────────
// One knowledge item per page (its sections aggregated + chunked downstream).
const ESSENCE_PAGES: { name: string; url: string; key: string; rows: () => Promise<{ content: unknown }[]> }[] = [
  { name: 'Our Story', url: '/our-essence/the-story', key: 'the-story', rows: () => prisma.ourEssenceTheStory.findMany({ where: { isActive: true }, select: { content: true } }) },
  { name: 'Core Values', url: '/our-essence/core-values', key: 'core-values', rows: () => prisma.ourEssenceCoreValues.findMany({ where: { isActive: true }, select: { content: true } }) },
  { name: 'For Mother Earth', url: '/our-essence/for-mother-earth', key: 'for-mother-earth', rows: () => prisma.ourEssenceForMotherEarth.findMany({ where: { isActive: true }, select: { content: true } }) },
  { name: 'Our Fair Share', url: '/our-essence/our-fair-share', key: 'our-fair-share', rows: () => prisma.ourEssenceOurFairShare.findMany({ where: { isActive: true }, select: { content: true } }) },
  { name: 'Social Initiatives', url: '/our-essence/social-initiatives', key: 'social-initiatives', rows: () => prisma.ourEssenceSocialInitiatives.findMany({ where: { isActive: true }, select: { content: true } }) },
  { name: 'The Jivo Capital', url: '/our-essence/the-jivo-capital', key: 'the-jivo-capital', rows: () => prisma.ourEssenceTheJivoCapital.findMany({ where: { isActive: true }, select: { content: true } }) },
  { name: 'Certifications & Quality', url: '/our-essence/certifications-quality-standards', key: 'certifications', rows: () => prisma.ourEssenceCertifications.findMany({ where: { isActive: true }, select: { content: true } }) },
];

export const cmsPagesAdapter: SourceAdapter = {
  key: 'cms-pages',
  name: 'CMS Pages',
  type: 'CMS_PAGE',
  defaultCollectionKey: 'our-essence',
  async fetchItems(): Promise<RawKnowledgeItem[]> {
    const items: RawKnowledgeItem[] = [];

    // Our Essence pages (dedicated tables) — one item per page.
    for (const p of ESSENCE_PAGES) {
      const rows = await p.rows();
      const text = toPlainText(rows.flatMap((r) => flatten(r.content)).join('\n'));
      if (!text) continue;
      items.push({
        externalKey: `essence:${p.key}`,
        entityType: 'PAGE',
        entityId: p.key,
        collectionKey: 'our-essence',
        title: p.name,
        content: text,
        url: p.url,
      });
    }

    // Generic CMS page-content table (baru-sahib, milestones, …) — group by page.
    const pageRows = await prisma.pageContent.findMany({
      where: { isActive: true },
      select: { page: true, content: true },
    });
    const byPage = new Map<string, string[]>();
    for (const r of pageRows) {
      (byPage.get(r.page) ?? byPage.set(r.page, []).get(r.page)!).push(...flatten(r.content));
    }
    for (const [page, parts] of byPage) {
      const text = toPlainText(parts.join('\n'));
      if (!text) continue;
      items.push({
        externalKey: `page:${page}`,
        entityType: 'PAGE',
        entityId: page,
        collectionKey: 'our-essence',
        title: page.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        content: text,
        url: `/our-essence/${page}`,
      });
    }

    // Home page content.
    const home = await prisma.homePage.findMany({ where: { isActive: true }, select: { content: true } });
    const homeText = toPlainText(home.flatMap((r) => flatten(r.content)).join('\n'));
    if (homeText) {
      items.push({
        externalKey: 'page:home',
        entityType: 'PAGE',
        entityId: 'home',
        collectionKey: 'home',
        title: 'Home',
        content: homeText,
        url: '/',
      });
    }

    return items;
  },
};

/** A prepared plug-in that returns nothing until its business module ships. */
function preparedAdapter(
  key: string,
  name: string,
  type: SourceAdapter['type'],
  collectionKey: string,
): SourceAdapter {
  return { key, name, type, defaultCollectionKey: collectionKey, fetchItems: async () => [] };
}

// Every source the platform is designed to serve — CMS Pages live, the rest
// prepared so adding real content later needs zero platform changes.
registerSourceAdapter(cmsPagesAdapter);
registerSourceAdapter(preparedAdapter('products', 'Products', 'PRODUCT', 'products'));
registerSourceAdapter(preparedAdapter('blogs', 'Blogs', 'BLOG', 'blogs'));
registerSourceAdapter(preparedAdapter('faqs', 'FAQs', 'FAQ', 'faq'));
registerSourceAdapter(preparedAdapter('recipes', 'Recipes', 'RECIPE', 'recipes'));
registerSourceAdapter(preparedAdapter('media', 'Media', 'MEDIA', 'media'));
registerSourceAdapter(preparedAdapter('community', 'Community', 'COMMUNITY', 'community'));
registerSourceAdapter(preparedAdapter('policies', 'Policies', 'POLICY', 'policies'));
