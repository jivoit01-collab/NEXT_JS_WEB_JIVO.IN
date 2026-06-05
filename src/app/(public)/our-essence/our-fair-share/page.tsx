import { JsonLd } from '@/components/shared/public';
import { OUR_FAIR_SHARE_SEO_PAGE, OurFairShareMain } from '@/modules/our-essence/our-fair-share';
import { defaultSections, defaultSeo } from '@/modules/our-essence/our-fair-share/data/defaults';
import { getOurFairShareSections } from '@/modules/our-essence/our-fair-share/data/queries';
import { getStructuredData, resolveSeo } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo(OUR_FAIR_SHARE_SEO_PAGE, defaultSeo);
}

export default async function OurFairSharePage() {
  const [sections, structuredData] = await Promise.all([
    getOurFairShareSections(),
    getStructuredData(OUR_FAIR_SHARE_SEO_PAGE, defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>([
    ['hero', defaultSections.hero],
    ['healthcare', defaultSections.healthcare],
    ['women', defaultSections.women],
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
      <OurFairShareMain sections={sectionMap} />
    </>
  );
}
