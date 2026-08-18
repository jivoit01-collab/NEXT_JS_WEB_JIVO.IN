import { JsonLd } from '@/components/shared/public';
import { OliveOilsMain } from '@/modules/our-products/olive-oils';
import { getOliveOilsSections } from '@/modules/our-products/olive-oils/data/queries';
import { defaultSeo } from '@/modules/our-products/olive-oils/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-products-olive-oils', defaultSeo);
}

export default async function OliveOilsPage() {
  const [sections, structuredData] = await Promise.all([
    getOliveOilsSections(),
    getStructuredData('our-products-olive-oils', defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>();
  for (const s of sections) {
    sectionMap.set(s.section, s.content);
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <OliveOilsMain sections={sectionMap} />
    </>
  );
}
