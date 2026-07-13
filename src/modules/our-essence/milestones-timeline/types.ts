export interface MilestonesTimelineVideoContent {
  /** Desktop / landscape video (e.g. 1920×1080). Also the fallback for all screens. */
  video: string;
  /** Optional small-screen / portrait video (e.g. 1080×1920). Used only on phones. */
  videoMobile: string;
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