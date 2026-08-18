// ── Section 1: Hero ──────────────────────────────────────────
// Mirrors the canola hero exactly — same layout, animation and fields.
export interface GroundnutOilsHeroContent {
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
export interface GroundnutProductVariant {
  /** Bottle image for this pack size. */
  image: string;
  /** Caption under the card, e.g. "1 Litre". */
  label: string;
  /** Optional link to the product/buy page. */
  href: string;
}

export interface GroundnutOilsRangeContent {
  heading: string;
  variants: GroundnutProductVariant[];
}

// ── Section 3: The goodness within ───────────────────────────
export interface GroundnutOilsGoodnessContent {
  heading: string;
  /** Intro paragraph under the heading. */
  paragraph: string;
  /** Heading above the benefits list. */
  benefitsHeading: string;
  /** Bullet lines, each rendered with a leading marker. */
  benefits: string[];
  /** Artwork shown to the right of the copy (hands holding groundnuts). */
  image: string;
}

// ── Section 4: Promising authenticity ────────────────────────
export interface GroundnutOilsAuthenticityContent {
  heading: string;
  /** Body copy under the heading; blank lines are preserved. */
  paragraph: string;
  /** Full-bleed field photo behind the copy. */
  backgroundImage: string;
}

// ── Section registry ─────────────────────────────────────────
export type GroundnutOilsSectionKey = 'hero' | 'range' | 'goodness' | 'authenticity';

export interface GroundnutOilsSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
