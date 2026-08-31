import { JsonLd } from '@/components/shared/public';
import { GroundnutOilsMain } from '@/modules/our-products/groundnut-oils';
import { getGroundnutOilsSections } from '@/modules/our-products/groundnut-oils/data/queries';
import { defaultSeo } from '@/modules/our-products/groundnut-oils/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-products-groundnut-oils', defaultSeo);
}

export default async function GroundnutOilsPage() {
  const [sections, structuredData] = await Promise.all([
    getGroundnutOilsSections(),
    getStructuredData('our-products-groundnut-oils', defaultSeo),
  ]);

  // Already ACTIVE-only + ordered by sortOrder (see the query) — pass through.
  const orderedSections = sections.map((s) => ({ section: s.section, content: s.content }));

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <GroundnutOilsMain sections={orderedSections} />
    </>
  );
}
