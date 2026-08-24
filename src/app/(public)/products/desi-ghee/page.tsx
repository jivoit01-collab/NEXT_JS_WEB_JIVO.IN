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

  const sectionMap = new Map<string, unknown>();
  for (const s of sections) {
    sectionMap.set(s.section, s.content);
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <DesiGheeMain sections={sectionMap} />
    </>
  );
}
