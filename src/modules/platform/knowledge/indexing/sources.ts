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

// ── Products adapter (REAL) ──────────────────────────────────
// Each product family lives in its own CMS table keyed by `section`
// ("hero", "range", "whatIsCanola", …). One knowledge item per family, with
// every section's text aggregated — chunking downstream keeps rows small.
const PRODUCT_FAMILIES: {
  key: string;
  name: string;
  url: string;
  rows: () => Promise<{ section: string; title: string | null; content: unknown }[]>;
}[] = [
  { key: 'canola', name: 'Jivo Canola Oil', url: '/products/canola-oils', rows: () => prisma.ourProductsCanolaOils.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { section: true, title: true, content: true } }) },
  { key: 'olive', name: 'Jivo Olive Oil', url: '/products/olive-oils', rows: () => prisma.ourProductsOliveOils.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { section: true, title: true, content: true } }) },
  { key: 'mustard', name: 'Jivo Mustard Oil', url: '/products/mustard-oils', rows: () => prisma.ourProductsMustardOils.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { section: true, title: true, content: true } }) },
  { key: 'groundnut', name: 'Jivo Groundnut Oil', url: '/products/groundnut-oils', rows: () => prisma.ourProductsGroundnutOils.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { section: true, title: true, content: true } }) },
];

export const productsAdapter: SourceAdapter = {
  key: 'products',
  name: 'Products',
  type: 'PRODUCT',
  defaultCollectionKey: 'products',
  async fetchItems(): Promise<RawKnowledgeItem[]> {
    const items: RawKnowledgeItem[] = [];
    for (const fam of PRODUCT_FAMILIES) {
      const rows = await fam.rows();
      // Prefix each section with its heading so keyword search can match on
      // section titles ("Why Cold-Pressed") as well as body copy.
      const text = toPlainText(
        rows.flatMap((r) => [r.title ?? '', ...flatten(r.content)]).join('\n'),
      );
      if (!text) continue;
      items.push({
        externalKey: `product:${fam.key}`,
        entityType: 'PRODUCT',
        entityId: fam.key,
        collectionKey: 'products',
        title: fam.name,
        content: `${fam.name}\n${text}`,
        url: fam.url,
      });
    }
    return items;
  },
};

// ── Company / Contact adapter (REAL) ─────────────────────────
// The single authoritative record for Jivo's address, email and phone lives in
// FooterSetting (rendered in the site footer). Indexing it means the assistant
// answers contact questions from real CMS data instead of inventing details.
export const companyAdapter: SourceAdapter = {
  key: 'company',
  name: 'Company & Contact',
  type: 'CUSTOM',
  defaultCollectionKey: 'company',
  async fetchItems(): Promise<RawKnowledgeItem[]> {
    const f = await prisma.footerSetting.findFirst();
    if (!f) return [];

    const lines = [
      f.tagline,
      f.brandPromise,
      f.brandPromiseSub,
      f.address ? `Address: ${f.address}` : null,
      f.email ? `Email: ${f.email}` : null,
      f.phone ? `Phone: ${f.phone}${f.phoneLabel ? ` ${f.phoneLabel}` : ''}` : null,
      f.certificationText,
      f.madeInText,
      f.copyrightText,
    ].filter((v): v is string => Boolean(v && v.trim()));

    const text = toPlainText(lines.join('\n'));
    if (!text) return [];

    return [
      {
        externalKey: 'company:contact',
        entityType: 'PAGE',
        entityId: 'contact',
        collectionKey: 'company',
        title: 'Jivo Contact Information',
        content: `Jivo Wellness contact details.\n${text}`,
        // No /contact route exists — the details live in the site footer. A URL
        // here would render as a link to a 404, so this document is deliberately
        // link-less: the Contact card shows the verified phone/email/address.
        url: undefined,
      },
    ];
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
registerSourceAdapter(productsAdapter);
registerSourceAdapter(companyAdapter);
registerSourceAdapter(preparedAdapter('blogs', 'Blogs', 'BLOG', 'blogs'));
registerSourceAdapter(preparedAdapter('faqs', 'FAQs', 'FAQ', 'faq'));
registerSourceAdapter(preparedAdapter('recipes', 'Recipes', 'RECIPE', 'recipes'));
registerSourceAdapter(preparedAdapter('media', 'Media', 'MEDIA', 'media'));
registerSourceAdapter(preparedAdapter('community', 'Community', 'COMMUNITY', 'community'));
registerSourceAdapter(preparedAdapter('policies', 'Policies', 'POLICY', 'policies'));
