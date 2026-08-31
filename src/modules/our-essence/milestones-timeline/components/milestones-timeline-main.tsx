import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { MilestonesTimelineVideoSkeleton } from './MilestonesTimelineVideo';

const MilestonesTimelineVideo = dynamic(
  () => import('./MilestonesTimelineVideo').then((mod) => mod.MilestonesTimelineVideo),
  { loading: () => <MilestonesTimelineVideoSkeleton /> },
);

/** Section key → component. Order + visibility come from the DB (sortOrder /
 *  isActive), not code. */
const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  video: MilestonesTimelineVideo as unknown as ComponentType<{ data?: unknown }>,
};

interface MilestonesTimelineMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function MilestonesTimelineMain({ sections }: MilestonesTimelineMainProps) {
  return (
    <>
      {sections.map(({ section, content }) => {
        const Component = SECTION_COMPONENTS[section];
        if (!Component) return null;
        return <Component key={section} data={content} />;
      })}
    </>
  );
}
