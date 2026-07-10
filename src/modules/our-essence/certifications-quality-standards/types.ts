export interface CertificationsHeroContent {
  heading: string;
  subheading: string;
  backgroundImage: string;
}

/** A single certification/quality badge. `image` is a transparent logo; `label` is used for alt text. */
export interface CertificationBadge {
  image: string;
  label: string;
}

export interface CertificationsBadgesContent {
  items: CertificationBadge[];
}

/** The wide, highlighted badge shown below the grid (e.g. U.S. FDA). */
export interface CertificationsFeaturedContent {
  enabled: boolean;
  image: string;
  label: string;
}

export type CertificationsSectionKey = 'hero' | 'badges' | 'featured';

export interface CertificationsSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
