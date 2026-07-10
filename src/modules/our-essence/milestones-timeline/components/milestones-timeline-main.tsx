import dynamic from 'next/dynamic';
import { MilestonesTimelineVideoSkeleton } from './MilestonesTimelineVideo';
import type { MilestonesTimelineVideoContent } from '../types';

const MilestonesTimelineVideo = dynamic(
  () => import('./MilestonesTimelineVideo').then((mod) => mod.MilestonesTimelineVideo),
  { loading: () => <MilestonesTimelineVideoSkeleton /> },
);

interface MilestonesTimelineMainProps {
  sections: Map<string, unknown>;
}

export function MilestonesTimelineMain({ sections }: MilestonesTimelineMainProps) {
  return (
    <MilestonesTimelineVideo
      data={sections.get('video') as MilestonesTimelineVideoContent | undefined}
    />
  );
}