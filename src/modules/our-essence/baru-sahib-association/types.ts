export interface BaruSahibAssociationHeroContent {
  title: string;
  description: string;
  image: string;
}

export interface BaruSahibAssociationVideoContent {
  video: string;
  /** Optional WebM/AV1 source. Browsers will prefer this before MP4 when provided. */
  videoWebm?: string;
  /** Optional optimized WebP poster shown before the large video begins decoding. */
  poster?: string;
  /** Intrinsic pixel size, captured on upload — reserves exact space (no layout jump). */
  videoWidth?: number;
  videoHeight?: number;
}

export interface BaruSahibAssociationHumanityContent {
  title: string;
  description: string;
  image: string;
}

export type BaruSahibAssociationSectionKey = 'hero' | 'video' | 'humanity';

export interface BaruSahibAssociationSectionRow {
  id: string;
  section: BaruSahibAssociationSectionKey;
  title: string | null;
  content:
    | BaruSahibAssociationHeroContent
    | BaruSahibAssociationVideoContent
    | BaruSahibAssociationHumanityContent;
  sortOrder: number;
  isActive: boolean;
}
