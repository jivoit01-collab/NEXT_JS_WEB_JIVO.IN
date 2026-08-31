import { JsonLd } from '@/components/shared/public';
import { WaterMain } from '@/modules/our-products/water';
import { getWaterSections } from '@/modules/our-products/water/data/queries';
import { defaultSeo } from '@/modules/our-products/water/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-products-water', defaultSeo);
}

export default async function WaterPage() {
  const [sections, structuredData] = await Promise.all([
    getWaterSections(),
    getStructuredData('our-products-water', defaultSeo),
  ]);

  // Already ACTIVE-only + ordered by sortOrder (see the query) — pass through.
  const orderedSections = sections.map((s) => ({ section: s.section, content: s.content }));

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <WaterMain sections={orderedSections} />
    </>
  );
}
