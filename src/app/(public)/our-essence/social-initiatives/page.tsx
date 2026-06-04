import { JsonLd } from '@/components/shared';
import {
  SOCIAL_INITIATIVES_SEO_PAGE,
  SocialInitiativesMain,
} from '@/modules/our-essence/social-initiatives';
import {
  defaultSections,
  defaultSeo,
  normalizeSocialInitiativesSection,
} from '@/modules/our-essence/social-initiatives/data/defaults';
import { getSocialInitiativesSections } from '@/modules/our-essence/social-initiatives/data/queries';
import { getStructuredData, resolveSeo } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo(SOCIAL_INITIATIVES_SEO_PAGE, defaultSeo);
}

export default async function SocialInitiativesPage() {
  const [sections, structuredData] = await Promise.all([
    getSocialInitiativesSections(),
    getStructuredData(SOCIAL_INITIATIVES_SEO_PAGE, defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>([
    ['hero', defaultSections.hero],
    ['responsibilities', defaultSections.responsibilities],
    ['educate', defaultSections.educate],
  ]);

  for (const section of sections) {
    if (!sectionMap.has(section.section)) continue;
    const sectionKey = section.section as keyof typeof defaultSections;
    const existing = sectionMap.get(section.section);
    sectionMap.set(section.section, {
      ...(typeof existing === 'object' && existing ? existing : {}),
      ...normalizeSocialInitiativesSection(sectionKey, section.content),
    });
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <SocialInitiativesMain sections={sectionMap} />
    </>
  );
}
