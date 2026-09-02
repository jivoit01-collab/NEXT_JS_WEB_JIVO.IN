// ── Section 1: Hero (flat green field) ───────────────────────
// Mirrors the water hero exactly — same layout, animation and fields.
export interface WheatgrassHeroContent {
  logoImage: string;
  heading: string;
  subtitleLineOne: string;
  subtitleLineTwo: string;
  ctaLabel: string;
  ctaHref: string;
  /**
   * The five flavour bottles, left → right as they appear in the fan.
   * Index 2 (the middle) renders largest; 1 and 3 a step smaller; 0 and 4
   * smallest — matching the design's staggered heights.
   */
  bottles: string[];
}

// ── Section 2: Range of products (carousel) ──────────────────
export interface WheatgrassVariant {
  image: string;
  /** Flavour name, e.g. "Rose". */
  label: string;
  /** Pack size shown under the flavour, e.g. "200ml". */
  size: string;
  href: string;
}

export interface WheatgrassRangeContent {
  heading: string;
  variants: WheatgrassVariant[];
}

// ── Section 3: More than a juice (copy + side image) ─────────
export interface WheatgrassWellnessContent {
  heading: string;
  paragraph: string;
  /** Decorative artwork bleeding off the section's right edge. */
  image: string;
}

// ── Section 4: A difference you can see (copy + side image) ──
export interface WheatgrassDifferenceContent {
  heading: string;
  paragraph: string;
  /** Decorative artwork bleeding off the section's right edge. */
  image: string;
}

// ── Section 5: Key highlights (icon row over a bg photo) ─────
export interface WheatgrassHighlight {
  image: string;
  label: string;
  description: string;
}

export interface WheatgrassHighlightsContent {
  heading: string;
  highlights: WheatgrassHighlight[];
  /** Full-bleed wheatgrass photo behind the row. */
  backgroundImage: string;
}

// ── Section registry ─────────────────────────────────────────
export type WheatgrassSectionKey =
  | 'hero'
  | 'range'
  | 'wellness'
  | 'difference'
  | 'highlights';

export interface WheatgrassSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
