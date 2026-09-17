import { JsonLd } from '@/components/shared/public';
import { CoffeeMain } from '@/modules/our-products/coffee';
import { getCoffeeSections } from '@/modules/our-products/coffee/data/queries';
import { defaultSeo } from '@/modules/our-products/coffee/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-products-coffee', defaultSeo);
}

export default async function CoffeePage() {
  const [sections, structuredData] = await Promise.all([
    getCoffeeSections(),
    getStructuredData('our-products-coffee', defaultSeo),
  ]);

  // Already ACTIVE-only + ordered by sortOrder (see the query) — pass through.
  const orderedSections = sections.map((s) => ({ section: s.section, content: s.content }));

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <CoffeeMain sections={orderedSections} />
    </>
  );
}
