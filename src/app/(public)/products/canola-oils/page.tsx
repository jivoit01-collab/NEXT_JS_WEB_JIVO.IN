import { JsonLd } from '@/components/shared/public';
import { CanolaOilsMain } from '@/modules/our-products/canola-oils';
import { getCanolaOilsSections } from '@/modules/our-products/canola-oils/data/queries';
import { defaultSeo } from '@/modules/our-products/canola-oils/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-products-canola-oils', defaultSeo);
}

export default async function CanolaOilsPage() {
  const [sections, structuredData] = await Promise.all([
    getCanolaOilsSections(),
    getStructuredData('our-products-canola-oils', defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>();
  for (const s of sections) {
    sectionMap.set(s.section, s.content);
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <CanolaOilsMain sections={sectionMap} />
    </>
  );
}
