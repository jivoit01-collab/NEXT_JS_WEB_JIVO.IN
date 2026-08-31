import { JsonLd } from '@/components/shared/public';
import { DesiGheeMain } from '@/modules/our-products/desi-ghee';
import { getDesiGheeSections } from '@/modules/our-products/desi-ghee/data/queries';
import { defaultSeo } from '@/modules/our-products/desi-ghee/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-products-desi-ghee', defaultSeo);
}

export default async function DesiGheePage() {
  const [sections, structuredData] = await Promise.all([
    getDesiGheeSections(),
    getStructuredData('our-products-desi-ghee', defaultSeo),
  ]);

  // `sections` is already ACTIVE-only and ordered by sortOrder (see the query),
  // so pass it straight through — the main component renders in this exact order.
  const orderedSections = sections.map((s) => ({ section: s.section, content: s.content }));

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <DesiGheeMain sections={orderedSections} />
    </>
  );
}
