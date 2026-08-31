import { JsonLd } from '@/components/shared/public';
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

  // Merge each ACTIVE DB section (ordered by sortOrder) with its default content,
  // so partially-filled sections still render fully while hidden ones are omitted.
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
      <SocialInitiativesMain sections={orderedSections} />
    </>
  );
}
