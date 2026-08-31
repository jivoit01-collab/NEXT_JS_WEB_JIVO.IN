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

  // Already ACTIVE-only + ordered by sortOrder (see the query) — pass through.
  const orderedSections = sections.map((s) => ({ section: s.section, content: s.content }));

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <RefinedGoldOilsMain sections={orderedSections} />
    </>
  );
}
