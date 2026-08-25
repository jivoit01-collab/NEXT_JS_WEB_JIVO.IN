import { JsonLd } from '@/components/shared/public';
import { RefinedGoldOilsMain } from '@/modules/our-products/refined-gold-oils';
import { getRefinedGoldOilsSections } from '@/modules/our-products/refined-gold-oils/data/queries';
import { defaultSeo } from '@/modules/our-products/refined-gold-oils/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-products-refined-gold-oils', defaultSeo);
}

export default async function RefinedGoldOilsPage() {
  const [sections, structuredData] = await Promise.all([
    getRefinedGoldOilsSections(),
    getStructuredData('our-products-refined-gold-oils', defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>();
  for (const s of sections) {
    sectionMap.set(s.section, s.content);
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <RefinedGoldOilsMain sections={sectionMap} />
    </>
  );
}
