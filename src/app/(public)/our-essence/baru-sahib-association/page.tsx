import { JsonLd } from '@/components/shared';
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

  const sectionMap = new Map<string, unknown>([
    ['hero', defaultSections.hero],
    ['video', defaultSections.video],
    ['humanity', defaultSections.humanity],
  ]);
  for (const section of sections) {
    const existing = sectionMap.get(section.section);
    sectionMap.set(section.section, {
      ...(typeof existing === 'object' && existing ? existing : {}),
      ...(section.content as object),
    });
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <BaruSahibAssociationMain sections={sectionMap} />
    </>
  );
}
