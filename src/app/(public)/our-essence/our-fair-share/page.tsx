import { JsonLd } from '@/components/shared/public';
import { OUR_FAIR_SHARE_SEO_PAGE, OurFairShareMain } from '@/modules/our-essence/our-fair-share';
import { defaultSections, defaultSeo } from '@/modules/our-essence/our-fair-share/data/defaults';
import { getOurFairShareSections } from '@/modules/our-essence/our-fair-share/data/queries';
import { getStructuredData, resolveSeo } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo(OUR_FAIR_SHARE_SEO_PAGE, defaultSeo);
}

export default async function OurFairSharePage() {
  const [sections, structuredData] = await Promise.all([
    getOurFairShareSections(),
    getStructuredData(OUR_FAIR_SHARE_SEO_PAGE, defaultSeo),
  ]);

  // Merge each ACTIVE DB section (ordered by sortOrder) with its default content,
  // so partially-filled sections still render fully while hidden ones are omitted.
  const defaults = defaultSections as Record<string, unknown>;
  const orderedSections = sections.map((s) => {
    const base = defaults[s.section];
    const baseObj = typeof base === 'object' && base ? base : {};
    const contentObj = typeof s.content === 'object' && s.content ? s.content : {};
    return { section: s.section, content: { ...baseObj, ...contentObj } };
  });

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <OurFairShareMain sections={orderedSections} />
    </>
  );
}
