// ── Section 1: Hero (flat espresso field, no background image) ─
export interface CoffeeHeroContent {
  logoImage: string;
  heading: string;
  subtitleLineOne: string;
  subtitleLineTwo: string;
  ctaLabel: string;
  ctaHref: string;
  /** Large jar render (front). */
  productImage: string;
  /** Smaller jar to the left of the large one. Optional. */
  productImageSecondary: string;
}

// ── Section 2: Range of products ─────────────────────────────
export interface CoffeeVariant {
  image: string;
  label: string;
  href: string;
}

export interface CoffeeRangeContent {
  heading: string;
  variants: CoffeeVariant[];
}

// ── Section 3: Key highlights (copy over a full-bleed photo) ──
export interface CoffeeKeyHighlightsContent {
  heading: string;
  /** Optional intro paragraph under the heading. */
  paragraph: string;
  /** Optional heading above the bullet list. */
  highlightsHeading: string;
  /** Bullet lines, each rendered with a leading marker. */
  highlights: string[];
  /** Full-bleed background photo (roasted beans). Empty = flat caramel field. */
  image: string;
}

// ── Section 4: Beyond beans (full-bleed art + top copy) ──────
export interface CoffeeBeyondBeansContent {
  heading: string;
  /** Body copy under the heading; line breaks are preserved. */
  paragraph: string;
  /**
   * Transparent line art (3:2) shown bottom-right on the flat #3D1F08 field.
   * Field name kept as `backgroundImage` for stored-data compatibility.
   * Empty = no artwork.
   */
  backgroundImage: string;
}

// ── Section registry ─────────────────────────────────────────
export type CoffeeSectionKey = 'hero' | 'range' | 'keyHighlights' | 'beyondBeans';

export interface CoffeeSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
