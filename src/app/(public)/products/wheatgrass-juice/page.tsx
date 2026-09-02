import { JsonLd } from '@/components/shared/public';
import { WheatgrassMain } from '@/modules/our-products/wheatgrass-juice';
import { getWheatgrassSections } from '@/modules/our-products/wheatgrass-juice/data/queries';
import { defaultSeo } from '@/modules/our-products/wheatgrass-juice/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-products-wheatgrass-juice', defaultSeo);
}

export default async function WheatgrassJuicePage() {
  const [sections, structuredData] = await Promise.all([
    getWheatgrassSections(),
    getStructuredData('our-products-wheatgrass-juice', defaultSeo),
  ]);

  // Already ACTIVE-only + ordered by sortOrder (see the query) — pass through.
  const orderedSections = sections.map((s) => ({ section: s.section, content: s.content }));

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <WheatgrassMain sections={orderedSections} />
    </>
  );
}
