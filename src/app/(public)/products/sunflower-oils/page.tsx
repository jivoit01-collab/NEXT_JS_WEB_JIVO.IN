import { JsonLd } from '@/components/shared/public';
import { SunflowerOilsMain } from '@/modules/our-products/sunflower-oils';
import { getSunflowerOilsSections } from '@/modules/our-products/sunflower-oils/data/queries';
import { defaultSeo } from '@/modules/our-products/sunflower-oils/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-products-sunflower-oils', defaultSeo);
}

export default async function SunflowerOilsPage() {
  const [sections, structuredData] = await Promise.all([
    getSunflowerOilsSections(),
    getStructuredData('our-products-sunflower-oils', defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>();
  for (const s of sections) {
    sectionMap.set(s.section, s.content);
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <SunflowerOilsMain sections={sectionMap} />
    </>
  );
}
