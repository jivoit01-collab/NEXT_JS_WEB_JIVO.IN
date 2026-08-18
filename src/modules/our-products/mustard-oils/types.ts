// ── Section 1: Hero ──────────────────────────────────────────
// Mirrors the groundnut hero exactly — same layout, animation and fields.
export interface MustardOilsHeroContent {
  /** Wordmark/logo lockup shown above the headline. */
  logoImage: string;
  heading: string;
  /** Two supporting lines under the headline. */
  subtitleLineOne: string;
  subtitleLineTwo: string;
  ctaLabel: string;
  ctaHref: string;
  /** Large bottle render (front of the pair), right side of the hero. */
  productImage: string;
  /** Smaller bottle render layered behind. Optional — omit for a single bottle. */
  productImageSecondary: string;
}

// ── Section 2: Range of products ─────────────────────────────
export interface MustardProductVariant {
  /** Bottle image for this pack size. */
  image: string;
  /** Caption under the card, e.g. "1 Litre". */
  label: string;
  /** Optional link to the product/buy page. */
  href: string;
}

export interface MustardOilsRangeContent {
  heading: string;
  variants: MustardProductVariant[];
}

// ── Section 3: Kachi ghani extraction ────────────────────────
export interface MustardOilsExtractionContent {
  heading: string;
  /** Intro paragraph under the heading. */
  paragraph: string;
  /** Second heading, above the strengths list. */
  benefitsHeading: string;
  /** Bullet lines, each rendered with a leading marker. */
  benefits: string[];
  /** Mustard-flower artwork shown to the right of the copy. */
  image: string;
}

// ── Section 4: A little warmth, every day ────────────────────
export interface MustardOilsWarmthContent {
  heading: string;
  /** Body copy under the heading; blank lines are preserved. */
  paragraph: string;
  /** Full-bleed sunset field photo behind the copy. */
  backgroundImage: string;
}

// ── Section registry ─────────────────────────────────────────
export type MustardOilsSectionKey = 'hero' | 'range' | 'extraction' | 'warmth';

export interface MustardOilsSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
