// ── Section 1: Hero ──────────────────────────────────────────
// Mirrors the groundnut hero exactly — same layout, animation and fields.
export interface SunflowerOilsHeroContent {
  logoImage: string;
  heading: string;
  subtitleLineOne: string;
  subtitleLineTwo: string;
  ctaLabel: string;
  ctaHref: string;
  productImage: string;
  productImageSecondary: string;
}

// ── Section 2: Range of products ─────────────────────────────
export interface SunflowerProductVariant {
  image: string;
  label: string;
  href: string;
}

export interface SunflowerOilsRangeContent {
  heading: string;
  variants: SunflowerProductVariant[];
}

// ── Section 3: Benefits (image left, heading + bullets) ──────
export interface SunflowerOilsBenefitsContent {
  /** Heading above the benefits list (the section's main heading). */
  benefitsHeading: string;
  /** Bullet lines, each rendered with a leading marker. */
  benefits: string[];
  /** Artwork shown to the LEFT of the copy (sunflower). */
  image: string;
}

// ── Section 4: Why it matters (bg image, centered top text) ──
export interface SunflowerOilsWhyItMattersContent {
  heading: string;
  /** Body copy under the heading; blank lines are preserved. */
  paragraph: string;
  /** Full-bleed sunflower-field photo behind the copy. */
  backgroundImage: string;
}

// ── Section registry ─────────────────────────────────────────
export type SunflowerOilsSectionKey = 'hero' | 'range' | 'benefits' | 'whyItMatters';

export interface SunflowerOilsSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
