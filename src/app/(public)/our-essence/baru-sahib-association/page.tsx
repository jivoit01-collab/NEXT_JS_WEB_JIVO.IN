import { JsonLd } from '@/components/shared/public';
import {
  BARU_SAHIB_ASSOCIATION_SEO_PAGE,
  BaruSahibAssociationMain,
  defaultSections,
  defaultSeo,
  getBaruSahibAssociationSections,
} from '@/modules/our-essence/baru-sahib-association';
import { getStructuredData, resolveSeo } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo(BARU_SAHIB_ASSOCIATION_SEO_PAGE, defaultSeo);
}

export default async function BaruSahibAssociationPage() {
  const [sections, structuredData] = await Promise.all([
    getBaruSahibAssociationSections(),
    getStructuredData(BARU_SAHIB_ASSOCIATION_SEO_PAGE, defaultSeo),
  ]);

  const defaults = defaultSections as Record<string, unknown>;
  const orderedSections = sections.map((s) => {
    const base = defaults[s.section];
    const baseObj = typeof base === 'object' && base ? base : {};
    const contentObj = typeof s.content === 'object' && s.content ? s.content : {};
    return { section: s.section, content: { ...baseObj, ...contentObj } };
  });

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <BaruSahibAssociationMain sections={orderedSections} />
    </>
  );
}
