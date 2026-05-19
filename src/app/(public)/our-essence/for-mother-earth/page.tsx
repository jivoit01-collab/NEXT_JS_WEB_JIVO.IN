import { unstable_noStore as noStore } from 'next/cache';
import { JsonLd } from '@/components/shared';
import {
  FOR_MOTHER_EARTH_SEO_PAGE,
  ForMotherEarthMain,
} from '@/modules/our-essence/for-mother-earth';
import { defaultSections, defaultSeo } from '@/modules/our-essence/for-mother-earth/data/defaults';
import { getForMotherEarthSections } from '@/modules/our-essence/for-mother-earth/data/queries';
import { getStructuredData, resolveSeo } from '@/modules/seo/utils';

export async function generateMetadata() {
  return resolveSeo(FOR_MOTHER_EARTH_SEO_PAGE, defaultSeo);
}

export default async function ForMotherEarthPage() {
  noStore();

  const [sections, structuredData] = await Promise.all([
    getForMotherEarthSections(),
    getStructuredData(FOR_MOTHER_EARTH_SEO_PAGE, defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>([
    ['hero', defaultSections.hero],
    ['cleanTree', defaultSections.cleanTree],
    ['disaster', defaultSections.disaster],
  ]);

  for (const section of sections) {
    const existing = sectionMap.get(section.section);
    sectionMap.set(section.section, {
      ...(typeof existing === 'object' && existing ? existing : {}),
      ...(section.content as object),
    });
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <ForMotherEarthMain sections={sectionMap} />
    </>
  );
}
