import { unstable_noStore as noStore } from 'next/cache';
import { JsonLd } from '@/components/shared';
import { CoreValuesMain } from '@/modules/our-essence/core-values';
import { getCoreValuesSections } from '@/modules/our-essence/core-values/data/queries';
import { defaultSeo } from '@/modules/our-essence/core-values/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export async function generateMetadata() {
  return resolveSeo('our-essence-core-values', defaultSeo);
}

export default async function CoreValuesPage() {
  noStore();

  const [sections, structuredData] = await Promise.all([
    getCoreValuesSections(),
    getStructuredData('our-essence-core-values', defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>();
  for (const s of sections) {
    sectionMap.set(s.section, s.content);
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <CoreValuesMain sections={sectionMap} />
    </>
  );
}
