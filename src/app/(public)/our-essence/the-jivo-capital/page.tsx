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

  const sectionMap = new Map<string, unknown>([
    ['hero', defaultSections.hero],
    ['oilPlant', defaultSections.oilPlant],
    ['waterPlant', defaultSections.waterPlant],
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
      <TheJivoCapitalMain sections={sectionMap} />
    </>
  );
}
