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

  const sectionMap = new Map<string, unknown>();
  for (const s of sections) {
    sectionMap.set(s.section, s.content);
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <MustardOilsMain sections={sectionMap} />
    </>
  );
}
