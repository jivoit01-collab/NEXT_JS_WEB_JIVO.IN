import { JsonLd } from '@/components/shared/public';
import {
  THE_JIVO_CAPITAL_SEO_PAGE,
  TheJivoCapitalMain,
} from '@/modules/our-essence/the-jivo-capital';
import {
  defaultSections,
  defaultSeo,
} from '@/modules/our-essence/the-jivo-capital/data/defaults';
import { getTheJivoCapitalSections } from '@/modules/our-essence/the-jivo-capital/data/queries';
import { getStructuredData, resolveSeo } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo(THE_JIVO_CAPITAL_SEO_PAGE, defaultSeo);
}

export default async function TheJivoCapitalPage() {
  const [sections, structuredData] = await Promise.all([
    getTheJivoCapitalSections(),
    getStructuredData(THE_JIVO_CAPITAL_SEO_PAGE, defaultSeo),
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
      <TheJivoCapitalMain sections={orderedSections} />
    </>
  );
}
