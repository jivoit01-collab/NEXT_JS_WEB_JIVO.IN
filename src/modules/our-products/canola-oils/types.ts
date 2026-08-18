// ── Section 1: Hero ──────────────────────────────────────────
export interface CanolaOilsHeroContent {
  /** Wordmark/logo lockup shown above the headline. */
  logoImage: string;
  heading: string;
  /** Two supporting lines under the headline. */
  subtitleLineOne: string;
  subtitleLineTwo: string;
  ctaLabel: string;
  ctaHref: string;
  /** Large bottle render (back of the pair), right side of the hero. */
  productImage: string;
  /** Smaller bottle render layered in front. Optional — omit for a single bottle. */
  productImageSecondary: string;
}

// ── Section 2: Range of products ─────────────────────────────
export interface CanolaProductVariant {
  /** Bottle image for this pack size. */
  image: string;
  /** Caption under the card, e.g. "1 Litre". */
  label: string;
  /** Optional link to the product/buy page. */
  href: string;
}

export interface CanolaOilsRangeContent {
  heading: string;
  variants: CanolaProductVariant[];
}

// ── Section 3: What is canola ────────────────────────────────
export interface CanolaFeature {
  /**
   * Feature artwork (admin upload). Replaces the old lucide icon.
   * SafeImage resolves empty/unknown values to the upload placeholder.
   */
  image: string;
  /**
   * Legacy lucide-react icon key. Retained so previously-saved section JSON
   * still parses; no longer rendered.
   * @deprecated use `image`
   */
  icon?: string;
  label: string;
  /** Optional longer copy (screenshot shows it on the last item). */
  description: string;
}

export interface CanolaOilsWhatIsContent {
  heading: string;
  /** Left column paragraph. */
  paragraphLeft: string;
  /** Right column paragraph. */
  paragraphRight: string;
  features: CanolaFeature[];
}

// ── Section 4: The science behind the gold ───────────────────
export interface CanolaOilsScienceContent {
  heading: string;
  intro: string;
  subheading: string;
  /** Bullet lines under "Nutritional Excellence". */
  points: string[];
  /** Closing italic-style line. */
  closingLine: string;
  /** Full-bleed canola field background. */
  backgroundImage: string;
}

// ── Section 5: Why cold-pressed ──────────────────────────────
export interface CanolaOilsColdPressedContent {
  heading: string;
  /** Two gold lead lines. */
  leadLineOne: string;
  leadLineTwo: string;
  /** Supporting paragraph under the lead lines. */
  paragraph: string;
  coldPressedTitle: string;
  coldPressedPoints: string[];
  refinedTitle: string;
  refinedPoints: string[];
}

// ── Section registry ─────────────────────────────────────────
export type CanolaOilsSectionKey =
  | 'hero'
  | 'range'
  | 'whatIsCanola'
  | 'science'
  | 'coldPressed';

export interface CanolaOilsSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
