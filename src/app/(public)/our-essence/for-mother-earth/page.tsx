import { JsonLd } from '@/components/shared/public';
import {
  FOR_MOTHER_EARTH_SEO_PAGE,
  ForMotherEarthMain,
} from '@/modules/our-essence/for-mother-earth';
import { defaultSections, defaultSeo } from '@/modules/our-essence/for-mother-earth/data/defaults';
import { getForMotherEarthSections } from '@/modules/our-essence/for-mother-earth/data/queries';
import { getStructuredData, resolveSeo } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo(FOR_MOTHER_EARTH_SEO_PAGE, defaultSeo);
}

export default async function ForMotherEarthPage() {
  const [sections, structuredData] = await Promise.all([
    getForMotherEarthSections(),
    getStructuredData(FOR_MOTHER_EARTH_SEO_PAGE, defaultSeo),
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
      <ForMotherEarthMain sections={orderedSections} />
    </>
  );
}
