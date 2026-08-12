// ── Section 1: Hero ──────────────────────────────────────────
// Mirrors the mustard hero exactly — same layout, animation and fields.
export interface OliveOilsHeroContent {
  /** Wordmark/logo lockup shown above the headline. */
  logoImage: string;
  heading: string;
  /** Two supporting lines under the headline. */
  subtitleLineOne: string;
  subtitleLineTwo: string;
  ctaLabel: string;
  ctaHref: string;
  /**
   * Three pack renders standing side by side on the right, in ascending size:
   * `productImage` is the smallest (back of the row) and `productImageThree`
   * the largest (front). All render upright — no tilt.
   * The 2nd and 3rd are optional; empty values simply render fewer packs.
   */
  productImage: string;
  productImageSecondary: string;
  productImageThree: string;
}

// ── Sections 2-4: Variant sections ───────────────────────────
// Extra Virgin, Extra Light and Pomace share one shape: centred copy above a
// row of pack cards, with decorative olive artwork on one side.
export interface OliveProductVariant {
  /** Pack image for this size. */
  image: string;
  /** Caption under the card, e.g. "1 Litre". */
  label: string;
  /** Optional link to the product/buy page. */
  href: string;
}

export interface OliveOilsVariantContent {
  heading: string;
  /** Lead paragraph under the heading. */
  paragraph: string;
  /** Optional second paragraph. */
  paragraphTwo: string;
  /** Closing "Best for: …" line. */
  bestFor: string;
  /** Decorative olive artwork beside the copy. */
  sideImage: string;
  variants: OliveProductVariant[];
}

// ── Section 5: The Jivo difference ───────────────────────────
export interface OliveOilsDifferenceContent {
  heading: string;
  /** Body copy under the heading; blank lines are preserved. */
  paragraph: string;
  /** Full-bleed olive-grove photo behind the copy. */
  backgroundImage: string;
}

// ── Section registry ─────────────────────────────────────────
export type OliveOilsSectionKey =
  | 'hero'
  | 'extraVirgin'
  | 'extraLight'
  | 'pomace'
  | 'difference';

export interface OliveOilsSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
