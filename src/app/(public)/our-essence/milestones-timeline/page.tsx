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

  // Merge each ACTIVE DB section (ordered by sortOrder) with its default content;
  // hidden sections are omitted.
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
      <MilestonesTimelineMain sections={orderedSections} />
    </>
  );
}