// ── Section 1: Hero ──────────────────────────────────────────
// Mirrors the groundnut hero exactly — same layout, animation and bottle sizes.
export interface RefinedGoldOilsHeroContent {
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
export interface RefinedGoldProductVariant {
  image: string;
  label: string;
  href: string;
}

export interface RefinedGoldOilsRangeContent {
  heading: string;
  variants: RefinedGoldProductVariant[];
}

// ── Section 3: Key highlights + benefits (two groups + side image) ──
export interface RefinedGoldOilsHighlightsContent {
  /** First group. */
  heading: string;
  highlights: string[];
  /** Second group. */
  benefitsHeading: string;
  benefits: string[];
  /** Heart-splash artwork on the right. */
  image: string;
}

// ── Section 4: What is Jivo Gold (bg image, copy on left) ────
export interface RefinedGoldOilsWhatIsContent {
  heading: string;
  /** Body copy; blank lines separate paragraphs. */
  paragraph: string;
  /** Full-bleed artwork behind the copy (bottles on a warm gradient). */
  backgroundImage: string;
}

// ── Section registry ─────────────────────────────────────────
export type RefinedGoldOilsSectionKey = 'hero' | 'range' | 'keyHighlights' | 'whatIsGold';

export interface RefinedGoldOilsSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
