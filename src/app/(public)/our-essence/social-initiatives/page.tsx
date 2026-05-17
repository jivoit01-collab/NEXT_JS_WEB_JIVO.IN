import { unstable_noStore as noStore } from 'next/cache';
import { JsonLd } from '@/components/shared';
import {
  SOCIAL_INITIATIVES_SEO_PAGE,
  SocialInitiativesMain,
} from '@/modules/our-essence/social-initiatives';
import {
  defaultSections,
  defaultSeo,
} from '@/modules/our-essence/social-initiatives/data/defaults';
import { getSocialInitiativesSections } from '@/modules/our-essence/social-initiatives/data/queries';
import { getStructuredData, resolveSeo } from '@/modules/seo/utils';

export async function generateMetadata() {
  return resolveSeo(SOCIAL_INITIATIVES_SEO_PAGE, defaultSeo);
}

export default async function SocialInitiativesPage() {
  noStore();

  const [sections, structuredData] = await Promise.all([
    getSocialInitiativesSections(),
    getStructuredData(SOCIAL_INITIATIVES_SEO_PAGE, defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>([
    ['hero', defaultSections.hero],
    ['alignment', defaultSections.alignment],
    ['responsibilities', defaultSections.responsibilities],
    ['educate', defaultSections.educate],
    ['cta', defaultSections.cta],
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
      <SocialInitiativesMain sections={sectionMap} />
    </>
  );
}
