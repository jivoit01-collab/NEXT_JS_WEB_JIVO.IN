// ── Section 1: Hero ──────────────────────────────────────────
export interface DesiGheeHeroContent {
  /** Wordmark/logo lockup shown above the headline. */
  logoImage: string;
  heading: string;
  /** Two supporting lines under the headline. */
  subtitleLineOne: string;
  subtitleLineTwo: string;
  ctaLabel: string;
  ctaHref: string;
  /** Large jar render (back of the pair), right side of the hero. */
  productImage: string;
  /** Smaller jar layered in front. Optional — omit for a single jar. */
  productImageSecondary: string;
}

// ── Section 2: Range of products ─────────────────────────────
export interface DesiGheeVariant {
  /** Jar image for this pack size. */
  image: string;
  /** Caption under the card, e.g. "1 Litre". */
  label: string;
  /** Optional link to the product/buy page. */
  href: string;
}

export interface DesiGheeRangeContent {
  heading: string;
  variants: DesiGheeVariant[];
}

// ── Section 3: Key highlights ────────────────────────────────
export interface DesiGheeHighlight {
  /** Bold lead-in, e.g. "From a Pure Source:". */
  label: string;
  /** Supporting copy following the label. */
  description: string;
}

export interface DesiGheeHighlightsContent {
  heading: string;
  highlights: DesiGheeHighlight[];
  /** Full-bleed artwork: jar on a podium against a valley. */
  backgroundImage: string;
}

// ── Section 4: The art of Bilona churning ────────────────────
export interface DesiGheeBilonaContent {
  heading: string;
  /** Body copy; blank lines separate paragraphs. */
  paragraph: string;
  /** Full-bleed artwork: village scene with the churning pot. */
  backgroundImage: string;
}

// ── Section registry ─────────────────────────────────────────
export type DesiGheeSectionKey = 'hero' | 'range' | 'keyHighlights' | 'bilona';

export interface DesiGheeSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
