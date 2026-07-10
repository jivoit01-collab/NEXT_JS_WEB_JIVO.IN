import { JsonLd } from '@/components/shared/public';
import {
  MILESTONES_TIMELINE_SEO_PAGE,
  MilestonesTimelineMain,
  defaultSections,
  defaultSeo,
  getMilestonesTimelineSections,
} from '@/modules/our-essence/milestones-timeline';
import { getStructuredData, resolveSeo } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo(MILESTONES_TIMELINE_SEO_PAGE, defaultSeo);
}

export default async function MilestonesTimelinePage() {
  const [sections, structuredData] = await Promise.all([
    getMilestonesTimelineSections(),
    getStructuredData(MILESTONES_TIMELINE_SEO_PAGE, defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>([['video', defaultSections.video]]);
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
      <MilestonesTimelineMain sections={sectionMap} />
    </>
  );
}