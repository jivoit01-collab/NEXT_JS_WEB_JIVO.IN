// ── Section 1: Hero (bg image) ───────────────────────────────
export interface WaterHeroContent {
  logoImage: string;
  heading: string;
  subtitleLineOne: string;
  subtitleLineTwo: string;
  ctaLabel: string;
  ctaHref: string;
  /** Large bottle render (front). */
  productImage: string;
  /** Smaller bottle behind. Optional. */
  productImageSecondary: string;
  /** Full-bleed background photo (mountain/lake). */
  backgroundImage: string;
}

// ── Section 2: Range of products ─────────────────────────────
export interface WaterVariant {
  image: string;
  label: string;
  href: string;
}

export interface WaterRangeContent {
  heading: string;
  variants: WaterVariant[];
}

// ── Section 3: A better bottle (copy + icon features) ────────
export interface WaterFeature {
  image: string;
  label: string;
  description: string;
}

export interface WaterBetterBottleContent {
  heading: string;
  paragraphLeft: string;
  paragraphRight: string;
  features: WaterFeature[];
}

// ── Section 4: Our mission (bg image, centered top copy) ─────
export interface WaterMissionContent {
  heading: string;
  paragraph: string;
  backgroundImage: string;
}

// ── Section registry ─────────────────────────────────────────
export type WaterSectionKey = 'hero' | 'range' | 'betterBottle' | 'mission';

export interface WaterSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
