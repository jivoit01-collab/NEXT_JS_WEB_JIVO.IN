export interface MilestonesTimelineVideoContent {
  video: string;
}

export type MilestonesTimelineSectionKey = 'video';

export interface MilestonesTimelineSectionRow {
  id: string;
  section: MilestonesTimelineSectionKey;
  title: string | null;
  content: MilestonesTimelineVideoContent;
  sortOrder: number;
  isActive: boolean;
}