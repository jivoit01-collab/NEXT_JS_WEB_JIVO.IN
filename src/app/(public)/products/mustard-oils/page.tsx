import { JsonLd } from '@/components/shared/public';
import { MustardOilsMain } from '@/modules/our-products/mustard-oils';
import { getMustardOilsSections } from '@/modules/our-products/mustard-oils/data/queries';
import { defaultSeo } from '@/modules/our-products/mustard-oils/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-products-mustard-oils', defaultSeo);
}

export default async function MustardOilsPage() {
  const [sections, structuredData] = await Promise.all([
    getMustardOilsSections(),
    getStructuredData('our-products-mustard-oils', defaultSeo),
  ]);

  // Already ACTIVE-only + ordered by sortOrder (see the query) — pass through.
  const orderedSections = sections.map((s) => ({ section: s.section, content: s.content }));

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <MustardOilsMain sections={orderedSections} />
    </>
  );
}
